# Fjernvarme Card

A Home Assistant Lovelace card for a district heating (fjernvarme) unit, built around the
entity layout exposed by Wavin Calefa / Sentio units and a Kamstrup wireless M-Bus billing
meter — but any set of matching sensors will work.

The card is a house-diagram layout: a left "FJERNVARMENET" column shows the primary
district-heating supply/return pipes plus the cooling (ΔT) and flow readings between them,
while the right "INDE I HUSET" area shows the radiator circuit, domestic hot water, and
outdoor temperature. Pipes animate only while there's actual flow, and the house interior
carries a constant warm tint. An optional details strip along the bottom breaks out
Fjernvarme / Radiator / Varmt vand metrics in more depth.

Plain JavaScript, no build step — copy the file in and register it as a dashboard resource.

## Installation

### HACS (custom repository)

1. In HACS, go to **Frontend** → the three-dot menu → **Custom repositories**.
2. Add `https://github.com/MRDonnii/ha-fjernvarme-card` as type **Dashboard**.
3. Install **Fjernvarme Card** and add the resource if HACS doesn't do it automatically.

### Manual

1. Download `ha-fjernvarme-card.js` from the latest release (or this repo).
2. Copy it to `config/www/community/ha-fjernvarme-card/ha-fjernvarme-card.js`.
3. Add it as a dashboard resource:
   ```yaml
   url: /local/community/ha-fjernvarme-card/ha-fjernvarme-card.js
   type: module
   ```

## Usage

Add the card via the dashboard editor (search for "Fjernvarme") or in YAML:

```yaml
type: custom:ha-fjernvarme-house-card
title: Fjernvarme
animation: true
show_details: true
entities:
  primary_supply: sensor.district_heating_supply_temperature
  primary_return: sensor.district_heating_return_temperature
  primary_valve: sensor.district_heating_main_valve
  primary_cooling: sensor.district_heating_cooling
  summer_cutoff: sensor.summer_cutoff_temperature
  pressure: sensor.system_pressure
  meter_power: sensor.heat_meter_power
  meter_flow: sensor.heat_meter_flow
  meter_energy_total: sensor.heat_meter_total_energy
  meter_volume_total: sensor.heat_meter_total_volume
  ch_supply: sensor.radiator_supply_temperature
  ch_return: sensor.radiator_return_temperature
  ch_valve: sensor.radiator_valve_position
  ch_flow: sensor.radiator_flow
  ch_power: sensor.radiator_power
  ch_outdoor: sensor.outdoor_temperature
  ch_pump: sensor.heating_pump_status
  dhw_cold_in: sensor.cold_water_temperature
  dhw_hot_out: sensor.hot_water_temperature
  dhw_flow: sensor.dhw_flow
  dhw_power: sensor.dhw_power
  dhw_valve: sensor.dhw_valve_position
  dhw_setpoint: sensor.dhw_setpoint
  dhw_status: sensor.dhw_status
  circulation_temp: sensor.circulation_return_temperature
  circulation_status: sensor.circulation_pump_status
  circulation_bypass_temp: sensor.circulation_bypass_temperature
  bvv_bypass_status: sensor.dhw_bypass_status
  standby: switch.unit_standby
  vacation: switch.unit_vacation
  sentio_active: input_boolean.heat_call_enabled
  sentio_status: sensor.heat_call_status
  sentio_call_active: input_boolean.heat_call_in_progress
  sentio_fejl: binary_sensor.heat_call_fault
  auto_standby_active: switch.auto_standby_enabled
  auto_standby_status: sensor.auto_standby_status
  auto_standby_engaged: binary_sensor.auto_standby_active
  auto_standby_fejl: binary_sensor.auto_standby_fault
  alarms:
    - binary_sensor.low_pressure_warning
    - binary_sensor.sensor_failure
```

All `entities` keys are optional — any pipe, label, or metric whose entity isn't configured
simply renders as `—`. `entities.alarms` accepts any list of `binary_sensor` entities; the
header turns red and shows a count when any of them are active.

## Configuration reference

| Key | Description |
|---|---|
| `title` | Card header text (default `Fjernvarme`) |
| `animation` | Toggle the animated pipe flow (default `true`) |
| `show_details` | Toggle the bottom Fjernvarme / Radiator / Varmt vand details strip (default `true`) |
| `entities.primary_supply` / `primary_return` | District heating supply/return temperature |
| `entities.primary_valve` | Main district heating valve position |
| `entities.primary_cooling` | Cooling / ΔT reading |
| `entities.summer_cutoff` | Summer cut-off setpoint temperature |
| `entities.pressure` | System pressure |
| `entities.meter_power` / `meter_flow` | Current power draw and flow rate |
| `entities.meter_energy_total` / `meter_volume_total` | Billing meter totals |
| `entities.ch_supply` / `ch_return` / `ch_valve` / `ch_flow` / `ch_power` / `ch_outdoor` / `ch_pump` | Central heating (radiator) circuit |
| `entities.dhw_cold_in` / `dhw_hot_out` / `dhw_flow` / `dhw_power` / `dhw_valve` / `dhw_setpoint` / `dhw_status` | Domestic hot water circuit |
| `entities.circulation_temp` / `circulation_status` / `circulation_bypass_temp` | DHW circulation/recirculation loop |
| `entities.bvv_bypass_status` | DHW/BVV bypass state |
| `entities.standby` / `vacation` | Switch entities shown as status metrics |
| `entities.sentio_active` / `sentio_status` / `sentio_call_active` / `sentio_fejl` | Optional external heat-call (Sentio-style) integration |
| `entities.auto_standby_active` / `auto_standby_status` / `auto_standby_engaged` / `auto_standby_fejl` | Optional automatic-standby integration |
| `entities.alarms` | List of `binary_sensor` entities aggregated into the header's alarm count |

## License

MIT — see [LICENSE](LICENSE).
