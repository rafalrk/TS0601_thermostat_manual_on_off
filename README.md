[🇬🇧 English version](README.en.md)


# TS0601_BY_RK.js
Minimalistyczny konwerter Zigbee2MQTT dla głowic Tuya TS0601 (ON / OFF)

## Po co ten konwerter istnieje

Ten konwerter powstał jako rozwiązanie realnego problemu:  
niektóre głowice termostatyczne Tuya TS0601 generują ogromne ilości raportów Zigbee, które:

- spamują MQTT
- powodują ciągłe zmiany stanów w Home Assistant
- zwiększają zużycie CPU i bazy danych
- destabilizują automatyzacje
- nie wnoszą realnej wartości w codziennym użytkowaniu

W instalacjach z wieloma głowicami (kilkanaście lub więcej) prowadziło to do:
- spowolnienia Home Assistant
- trudnej diagnostyki
- nieprzewidywalnego działania automatyzacji

## Świadoma decyzja projektowa

Zamiast walczyć z każdą raportowaną zmienną, przyjęto podejście:

minimalizm zamiast kompletności

Konwerter:
- usuwa wszystkie zbędne expose’y
- ignoruje raporty temperatur, trybów i kalibracji
- redukuje sterowanie do jednej prostej akcji: ON / OFF

Efekt:
- minimalny ruch Zigbee
- brak spamu MQTT
- stabilny Home Assistant
- przewidywalne automatyzacje

## Jak działa konwerter

Głowice Tuya TS0601 sterowane są poprzez datapoint DP=2 (setpoint).

Mapowanie:
- ON  -> wysyłane 45°C (zawór wymuszony maksymalnie otwarty)
- OFF -> wysyłane 0°C (zawór zamknięty)

Każda inna wartość:
- traktowana jest jako ON
- nie jest korygowana zwrotnie, aby nie generować dodatkowego ruchu Zigbee

Stan publikowany jest natychmiast po wysłaniu komendy, bez oczekiwania na kolejne raporty z urządzenia.

## Co NIE jest udostępniane (celowo)

Ten konwerter świadomie nie udostępnia:
- temperatury zadanej
- trybów pracy
- kalibracji i offsetów
- danych diagnostycznych

Nie jest to błąd ani brak funkcji — to celowe ograniczenie, mające na celu stabilność systemu.

## Udostępnione expose

- Switch (ON / OFF) – główne sterowanie zaworem
- Battery (%) – jeśli urządzenie raportuje
- Local temperature (°C) – tylko pasywnie

## Jak dodać konwerter do Zigbee2MQTT

1. Skopiuj plik TS0601_BY_RK.js do katalogu Zigbee2MQTT, .:
   /zigbee2mqtt/external_converters/TS0601_BY_RK.js
   jesli katalog external_converters nie istnieje dodaj go

2. W pliku /zigbee2mqtt/configuration.yaml dodaj:
   ```
   external_converters:
     - TS0601_BY_RK.js
   ```
![conf](https://github.com/user-attachments/assets/a7057153-2b3a-4db5-b2d1-ac4f3d0719c9)

3. Zrestartuj Zigbee2MQTT

## Jak dodać nową głowicę (fingerprint)

Jeśli Twoja głowica TS0601 nie jest obsługiwana, należy dodać jej identyfikator.

1. W Zigbee2MQTT sprawdź:
   - modelID
   - manufacturerName

   Przykład:
   modelID: TS0601
   manufacturerName: _TZE200_xxxxxxxx

2. W pliku TS0601_BY_RK.js dodaj nowy fingerprint do listy:
   ``` 
   { modelID: 'TS0601', manufacturerName: '_TZE200_NOWYID' }
    ```
<img width="1371" height="1282" alt="add new trv" src="https://github.com/user-attachments/assets/f1e24681-78da-4464-8183-a78c7d2229dd" />

4. Zrestartuj Zigbee2MQTT

## Dla kogo ten konwerter jest przeznaczony

- instalacje z wieloma głowicami TRV
- systemy wrażliwe na spam MQTT
- proste sterowanie otwórz / zamknij
- stabilne automatyzacje

Nie jest przeznaczony dla osób oczekujących pełnej kontroli temperatury z Home Assistant.

## Podsumowanie

Ten konwerter nie próbuje być idealny.  
Jego celem jest stabilność, cisza i przewidywalność działania.
