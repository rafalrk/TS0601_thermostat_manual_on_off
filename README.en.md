[🇵🇱 Polish version](README.md)


# TS0601_BY_RK.js
Minimalist Zigbee2MQTT converter for Tuya TS0601 TRV heads (ON / OFF)

## Why this converter exists

This converter was created to solve a real-world problem:  
some Tuya TS0601 thermostatic radiator valves generate a huge amount of Zigbee reports, which:

- spam MQTT
- cause constant state changes in Home Assistant
- increase CPU usage and database load
- destabilise automations
- provide no real value in everyday use

In installations with many TRVs (a dozen or more), this resulted in:
- Home Assistant slowdowns
- difficult troubleshooting
- unpredictable automation behaviour

## Conscious design decision

Instead of fighting every reported variable, a different approach was chosen:

minimalism over completeness

This converter:
- removes all unnecessary exposes
- ignores temperature, mode, and calibration reports
- reduces control to a single simple action: ON / OFF

Result:
- minimal Zigbee traffic
- no MQTT spam
- stable Home Assistant
- predictable automations

## How the converter works

Tuya TS0601 TRVs are controlled using datapoint DP=2 (setpoint).

Mapping:
- ON  -> sends 45°C (valve forced fully open)
- OFF -> sends 0°C (valve fully closed)

Any other value:
- is treated as ON
- is not corrected back to avoid generating additional Zigbee traffic

The state is published immediately after sending the command, without waiting for further device reports.

## What is NOT exposed (by design)

This converter deliberately does NOT expose:
- target temperature
- operating modes
- calibration or offsets
- diagnostic data

This is not a bug or missing feature — it is a deliberate limitation to ensure system stability.

## Exposed features

- Switch (ON / OFF) – main valve control
- Battery (%) – if reported by the device
- Local temperature (°C) – passive only

## How to add the converter to Zigbee2MQTT

1. Copy the file TS0601_BY_RK.js to the Zigbee2MQTT directory, for example:
   /zigbee2mqtt/external_converters/TS0601_BY_RK.js

   If the external_converters directory does not exist, create it.

2. In /zigbee2mqtt/configuration.yaml add:
      ```
   external_converters:
     - TS0601_BY_RK.js
   ```
![conf](https://github.com/user-attachments/assets/a7057153-2b3a-4db5-b2d1-ac4f3d0719c9)

3. Restart Zigbee2MQTT

## How to add a new TRV (fingerprint)

If your TS0601 TRV is not supported, you need to add its identifier.

1. In Zigbee2MQTT, check:
   - modelID
   - manufacturerName

   Example:
   modelID: TS0601
   manufacturerName: _TZE200_xxxxxxxx

2. In TS0601_BY_RK.js add a new fingerprint entry:
   ``` 
   { modelID: 'TS0601', manufacturerName: '_TZE200_NOWYID' }
    ```
<img width="1371" height="1282" alt="add new trv" src="https://github.com/user-attachments/assets/f1e24681-78da-4464-8183-a78c7d2229dd" />

3. Restart Zigbee2MQTT

## Who this converter is for

- installations with many TRVs
- systems sensitive to MQTT spam
- simple open / close valve control
- stable and predictable automations

It is NOT intended for users who expect full temperature control from Home Assistant.

## Summary

This converter does not try to be perfect.  
Its goal is stability, silence, and predictable behaviour.
