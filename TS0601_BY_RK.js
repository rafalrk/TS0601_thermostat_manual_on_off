const exposes = require('zigbee-herdsman-converters/lib/exposes');
const ea = exposes.access;

function intTo4BytesBE(value) {
    return [(value >> 24) & 0xFF, (value >> 16) & 0xFF, (value >> 8) & 0xFF, value & 0xFF];
}

async function sendSetpoint(entity, setpoint) {
    const payload = {
        seq: 0,
        dpValues: [{
            dp: 2,
            datatype: 0x02,
            data: intTo4BytesBE(setpoint),
        }],
    };
    await entity.command('manuSpecificTuya', 'dataRequest', payload, {disableDefaultResponse: true});
}

module.exports = [
    {
        fingerprint: [
         { modelID: 'TS0601', manufacturerName: '_TZE200_b6wax7g0' },
         { modelID: 'TS0601', manufacturerName: '_TZE204_pcdmj88b' }
        ],
        model: 'TS0601-TRV-MANUAL-RK',
        vendor: 'Moes',
        description: 'TS0601 TRV manual ON/OFF (ON=45, OFF=0, auto-sync)',
        fromZigbee: [
            {
                cluster: 'manuSpecificTuya',
                type: ['commandDataResponse', 'commandDataReport'],
                convert: (model, msg, publish, options, meta) => {
                    const dp = msg.data.dpValues[0].dp;
                    const raw = msg.data.dpValues[0].data;
                    const value = raw[3]; // ostatni bajt wystarcza dla setpoint

                    if (dp === 2) {
                        if (value === 0) {
                            return {state: 'OFF', current_heating_setpoint: 0};
                        } else if (value >= 45) {
                            return {state: 'ON', current_heating_setpoint: 45};
                        } else {
                            // jeżeli przyjdzie np. 22 → traktujemy jako ON, ale poprawki nie wysyłamy z fromZigbee
                            return {state: 'ON', current_heating_setpoint: 45};
                        }
                    }
                },
            },
        ],
        toZigbee: [
            {
                key: ['state'],
                convertSet: async (entity, key, value) => {
                    let setpoint = 0;
                    if (value.toLowerCase() === 'on') setpoint = 45;
                    if (value.toLowerCase() === 'off') setpoint = 0;

                    await sendSetpoint(entity, setpoint);

                    // natychmiast publikujemy nowy stan
                    return {state: {state: value.toUpperCase(), current_heating_setpoint: setpoint}};
                },
            },
        ],
        exposes: [
            exposes.switch().withState('state', ea.ALL)
                .withDescription('ON = valve forced open (45°C), OFF = valve closed (0°C)'),
            exposes.numeric('battery', ea.STATE).withUnit('%').withDescription('Battery level'),
            exposes.numeric('local_temperature', ea.STATE).withUnit('°C').withDescription('Measured local temperature'),
        ],
    },
];
