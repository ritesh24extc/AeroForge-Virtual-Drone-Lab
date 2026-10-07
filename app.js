/* ══════════════════════════════════════════════════════════════════════
   AEROFORGE — VIRTUAL DRONE LAB & CIRCUIT SIMULATOR
   app.js
   Requires: Fabric.js 5.x
   ══════════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

/* ─────────────────────────────────────────────────────────────────
   0. INTEGRITY CHECK FOR FABRIC.JS
   ───────────────────────────────────────────────────────────────── */
if (typeof fabric === 'undefined') {
  const root = document.getElementById('canvasWrap') || document.body;
  root.innerHTML =
    '<div style="padding:40px;color:#f0f4f8;font-family:sans-serif;line-height:1.6;text-align:center">' +
    '<h2 style="color:#ef4444;margin-bottom:12px">⚠️ Fabric.js Engine Failed to Load</h2>' +
    '<p>Please verify internet connectivity to load Fabric.js from CDN, then refresh the page.</p></div>';
  return;
}

/* ═════════════════════════════════════════════════════════════════
   1. STRICTLY DIY DRONE COMPONENT DATABASE
   ═════════════════════════════════════════════════════════════════ */
const DB = {
  /* ------------------- FLIGHT CONTROLLERS & MCUS ------------------- */
  "Microcontrollers": {
    categoryLabel: "Flight Controllers & MCUs",
    color: '#161d28',
    borderColor: '#00f0c0',
    w: 190, h: 190,
    desc: 'Central flight controller brains. Processes sensor data, executes attitude PID loops, and outputs PWM to ESCs.',
    variants: [
      "STM32F405 Flight Controller",
      "STM32F722 Advanced FC",
      "ESP32-S3 Drone Core",
      "Arduino Nano (ATmega328P)",
      "RP2040 Drone Node"
    ],
    getDetails: function(variant) {
      if (variant.includes("STM32F405")) {
        return {
          chip: 'STM32F405RGT6',
          family: 'STM32',
          pcbColor: '#161d28',
          accent: '#00f0c0',
          w: 190, h: 190,
          pins: [
            { name:'5V',     desc:'5V Regulated Rail',    signal:'power_5v',   gpio:5,   voltage:'5.0V' },
            { name:'3V3',    desc:'3.3V Sensor Rail',     signal:'power_3v3',  gpio:3,   voltage:'3.3V' },
            { name:'GND',    desc:'Common Ground',        signal:'gnd',        gpio:-1,  voltage:'0V'   },
            { name:'SDA',    desc:'I2C1 Data (Sensors)',  signal:'i2c_sda',    gpio:21,  voltage:'3.3V' },
            { name:'SCL',    desc:'I2C1 Clock (Sensors)', signal:'i2c_scl',    gpio:22,  voltage:'3.3V' },
            { name:'TX1',    desc:'UART1 TX (GPS)',       signal:'uart_tx',    gpio:9,   voltage:'3.3V' },
            { name:'RX1',    desc:'UART1 RX (GPS)',       signal:'uart_rx',    gpio:10,  voltage:'3.3V' },
            { name:'TX2',    desc:'UART2 TX (Telemetry)', signal:'uart_tx',    gpio:2,   voltage:'3.3V' },
            { name:'RX2',    desc:'UART2 RX (Telemetry)', signal:'uart_rx',    gpio:3,   voltage:'3.3V' },
            { name:'M1',     desc:'PWM Motor 1 (Front R)',signal:'pwm',        gpio:4,   voltage:'3.3V' },
            { name:'M2',     desc:'PWM Motor 2 (Rear R)', signal:'pwm',        gpio:13,  voltage:'3.3V' },
            { name:'M3',     desc:'PWM Motor 3 (Rear L)', signal:'pwm',        gpio:14,  voltage:'3.3V' },
            { name:'M4',     desc:'PWM Motor 4 (Front L)',signal:'pwm',        gpio:27,  voltage:'3.3V' },
            { name:'VBAT',   desc:'ADC Battery Monitor',  signal:'adc',        gpio:34,  voltage:'0-25V'}
          ]
        };
      } else if (variant.includes("STM32F722")) {
        return {
          chip: 'STM32F722RET6',
          family: 'STM32',
          pcbColor: '#121720',
          accent: '#38bdf8',
          w: 190, h: 190,
          pins: [
            { name:'5V',     desc:'5V BEC Rail',          signal:'power_5v',   gpio:5,   voltage:'5.0V' },
            { name:'3V3',    desc:'3.3V LDO Rail',        signal:'power_3v3',  gpio:3,   voltage:'3.3V' },
            { name:'GND',    desc:'System Ground',        signal:'gnd',        gpio:-1,  voltage:'0V'   },
            { name:'SDA',    desc:'I2C1 Data',            signal:'i2c_sda',    gpio:21,  voltage:'3.3V' },
            { name:'SCL',    desc:'I2C1 Clock',           signal:'i2c_scl',    gpio:22,  voltage:'3.3V' },
            { name:'TX1',    desc:'UART1 TX (CRSF/ELRS)', signal:'uart_tx',    gpio:9,   voltage:'3.3V' },
            { name:'RX1',    desc:'UART1 RX (CRSF/ELRS)', signal:'uart_rx',    gpio:10,  voltage:'3.3V' },
            { name:'TX6',    desc:'UART6 TX (GPS)',       signal:'uart_tx',    gpio:6,   voltage:'3.3V' },
            { name:'RX6',    desc:'UART6 RX (GPS)',       signal:'uart_rx',    gpio:7,   voltage:'3.3V' },
            { name:'M1',     desc:'Motor 1 DShot/PWM',    signal:'pwm',        gpio:4,   voltage:'3.3V' },
            { name:'M2',     desc:'Motor 2 DShot/PWM',    signal:'pwm',        gpio:13,  voltage:'3.3V' },
            { name:'M3',     desc:'Motor 3 DShot/PWM',    signal:'pwm',        gpio:14,  voltage:'3.3V' },
            { name:'M4',     desc:'Motor 4 DShot/PWM',    signal:'pwm',        gpio:27,  voltage:'3.3V' },
            { name:'BUZ-',   desc:'Buzzer Active Low',    signal:'pwm',        gpio:12,  voltage:'5.0V' }
          ]
        };
      } else if (variant.includes("ESP32")) {
        return {
          chip: 'ESP32-S3',
          family: 'ESP32',
          pcbColor: '#171c26',
          accent: '#eab308',
          w: 165, h: 220,
          hasShield: true,
          pins: [
            { name:'5V',     desc:'USB 5V In / Out',      signal:'power_5v',   gpio:5,   voltage:'5.0V' },
            { name:'3V3',    desc:'3.3V Regulated Output',signal:'power_3v3',  gpio:3,   voltage:'3.3V' },
            { name:'GND',    desc:'Ground',               signal:'gnd',        gpio:-1,  voltage:'0V'   },
            { name:'IO21',   desc:'I2C SDA',              signal:'i2c_sda',    gpio:21,  voltage:'3.3V' },
            { name:'IO22',   desc:'I2C SCL',              signal:'i2c_scl',    gpio:22,  voltage:'3.3V' },
            { name:'TX0',    desc:'UART0 TX',             signal:'uart_tx',    gpio:1,   voltage:'3.3V' },
            { name:'RX0',    desc:'UART0 RX',             signal:'uart_rx',    gpio:3,   voltage:'3.3V' },
            { name:'IO16',   desc:'UART1 TX (GPS/Telem)', signal:'uart_tx',    gpio:16,  voltage:'3.3V' },
            { name:'IO17',   desc:'UART1 RX (GPS/Telem)', signal:'uart_rx',    gpio:17,  voltage:'3.3V' },
            { name:'IO4',    desc:'PWM ESC 1',            signal:'pwm',        gpio:4,   voltage:'3.3V' },
            { name:'IO13',   desc:'PWM ESC 2',            signal:'pwm',        gpio:13,  voltage:'3.3V' },
            { name:'IO14',   desc:'PWM ESC 3',            signal:'pwm',        gpio:14,  voltage:'3.3V' },
            { name:'IO27',   desc:'PWM ESC 4',            signal:'pwm',        gpio:27,  voltage:'3.3V' },
            { name:'IO34',   desc:'ADC Battery Sense',    signal:'adc',        gpio:34,  voltage:'0-3.3V'}
          ]
        };
      } else if (variant.includes("Nano")) {
        return {
          chip: 'ATmega328P',
          family: 'AVR',
          pcbColor: '#007a87', /* Iconic Arduino Teal */
          accent: '#ffffff',
          w: 120, h: 235,
          pins: [
            { name:'VIN',    desc:'7-12V Power In',       signal:'power_5v',   gpio:99,  voltage:'7-12V'},
            { name:'5V',     desc:'5V Regulated Out',     signal:'power_5v',   gpio:5,   voltage:'5.0V' },
            { name:'3V3',    desc:'3.3V Output',          signal:'power_3v3',  gpio:3,   voltage:'3.3V' },
            { name:'GND',    desc:'Ground',               signal:'gnd',        gpio:-1,  voltage:'0V'   },
            { name:'A4',     desc:'I2C SDA (Analog 4)',   signal:'i2c_sda',    gpio:18,  voltage:'5.0V' },
            { name:'A5',     desc:'I2C SCL (Analog 5)',   signal:'i2c_scl',    gpio:19,  voltage:'5.0V' },
            { name:'D0',     desc:'UART RX',              signal:'uart_rx',    gpio:0,   voltage:'5.0V' },
            { name:'D1',     desc:'UART TX',              signal:'uart_tx',    gpio:1,   voltage:'5.0V' },
            { name:'D3',     desc:'PWM Motor 1',          signal:'pwm',        gpio:3,   voltage:'5.0V' },
            { name:'D5',     desc:'PWM Motor 2',          signal:'pwm',        gpio:5,   voltage:'5.0V' },
            { name:'D6',     desc:'PWM Motor 3',          signal:'pwm',        gpio:6,   voltage:'5.0V' },
            { name:'D9',     desc:'PWM Motor 4',          signal:'pwm',        gpio:9,   voltage:'5.0V' },
            { name:'A0',     desc:'ADC Battery Monitor',  signal:'adc',        gpio:14,  voltage:'0-5V' }
          ]
        };
      } else {
        return {
          chip: 'RP2040',
          family: 'RP2040',
          pcbColor: '#0e5f38', /* Raspberry Pi Green */
          accent: '#22c55e',
          w: 125, h: 225,
          pins: [
            { name:'VBUS',   desc:'5V USB Power In',      signal:'power_5v',   gpio:5,   voltage:'5.0V' },
            { name:'3V3',    desc:'3.3V Regulated Out',   signal:'power_3v3',  gpio:3,   voltage:'3.3V' },
            { name:'GND',    desc:'Ground',               signal:'gnd',        gpio:-1,  voltage:'0V'   },
            { name:'GP4',    desc:'I2C0 SDA',             signal:'i2c_sda',    gpio:4,   voltage:'3.3V' },
            { name:'GP5',    desc:'I2C0 SCL',             signal:'i2c_scl',    gpio:5,   voltage:'3.3V' },
            { name:'GP0',    desc:'UART0 TX',             signal:'uart_tx',    gpio:0,   voltage:'3.3V' },
            { name:'GP1',    desc:'UART0 RX',             signal:'uart_rx',    gpio:1,   voltage:'3.3V' },
            { name:'GP16',   desc:'PWM Motor 1',          signal:'pwm',        gpio:16,  voltage:'3.3V' },
            { name:'GP17',   desc:'PWM Motor 2',          signal:'pwm',        gpio:17,  voltage:'3.3V' },
            { name:'GP18',   desc:'PWM Motor 3',          signal:'pwm',        gpio:18,  voltage:'3.3V' },
            { name:'GP19',   desc:'PWM Motor 4',          signal:'pwm',        gpio:19,  voltage:'3.3V' },
            { name:'GP26',   desc:'ADC0 Battery Monitor', signal:'adc',        gpio:26,  voltage:'0-3.3V'}
          ]
        };
      }
    }
  },

  /* ------------------- SENSORS & NAVIGATION ------------------- */
  "Sensors & Navigation": {
    categoryLabel: "Sensors & Navigation",
    color: '#0369a1',
    borderColor: '#38bdf8',
    w: 130, h: 140,
    desc: 'High-precision flight dynamics sensors: 6-axis IMUs, barometric altitude, GNSS satellite positioning, and laser ToF ranging.',
    variants: [
      "MPU-6050 (6-DOF IMU)",
      "BMI270 (Low-Noise IMU)",
      "BMP280 (Barometer)",
      "u-blox NEO-M9N (GNSS/GPS)",
      "VL53L1X (ToF Distance)"
    ],
    getDetails: function(variant) {
      if (variant.includes("MPU-6050")) {
        return {
          chip: 'MPU-6050',
          pcbColor: '#0284c7', /* Royal Blue */
          sensorType: 'IMU',
          w: 120, h: 145,
          pins: [
            { name:'VCC', desc:'3.3V - 5V Supply',  signal:'power_5v',   voltage:'3.3-5V' },
            { name:'GND', desc:'Ground',            signal:'gnd',        voltage:'0V'     },
            { name:'SCL', desc:'I2C Clock',         signal:'i2c_scl',    voltage:'3.3V'   },
            { name:'SDA', desc:'I2C Data',          signal:'i2c_sda',    voltage:'3.3V'   },
            { name:'XDA', desc:'Aux I2C Data',      signal:'gpio',       voltage:'3.3V'   },
            { name:'XCL', desc:'Aux I2C Clock',     signal:'gpio',       voltage:'3.3V'   },
            { name:'AD0', desc:'I2C Address Select',signal:'gpio',       voltage:'3.3V'   },
            { name:'INT', desc:'Data-Ready IRQ',    signal:'gpio',       voltage:'3.3V'   }
          ]
        };
      } else if (variant.includes("BMI270")) {
        return {
          chip: 'BOSCH BMI270',
          pcbColor: '#3b0764', /* Dark Violet */
          sensorType: 'IMU',
          w: 110, h: 135,
          pins: [
            { name:'VCC',  desc:'3.3V Supply',     signal:'power_3v3',  voltage:'3.3V' },
            { name:'GND',  desc:'Ground',          signal:'gnd',        voltage:'0V'   },
            { name:'SDA',  desc:'I2C Data',        signal:'i2c_sda',    voltage:'3.3V' },
            { name:'SCL',  desc:'I2C Clock',       signal:'i2c_scl',    voltage:'3.3V' },
            { name:'INT1', desc:'FIFO/Motion IRQ', signal:'gpio',       voltage:'3.3V' },
            { name:'INT2', desc:'Data Ready IRQ',  signal:'gpio',       voltage:'3.3V' }
          ]
        };
      } else if (variant.includes("BMP280")) {
        return {
          chip: 'BMP280 BARO',
          pcbColor: '#581c87', /* Purple */
          sensorType: 'BARO',
          w: 105, h: 125,
          pins: [
            { name:'VCC', desc:'3.3V Supply',     signal:'power_3v3',  voltage:'3.3V' },
            { name:'GND', desc:'Ground',          signal:'gnd',        voltage:'0V'   },
            { name:'SCL', desc:'I2C Clock',       signal:'i2c_scl',    voltage:'3.3V' },
            { name:'SDA', desc:'I2C Data',        signal:'i2c_sda',    voltage:'3.3V' },
            { name:'CSB', desc:'SPI Chip Select', signal:'spi_cs',     voltage:'3.3V' },
            { name:'SDO', desc:'SPI MISO / Addr', signal:'spi_miso',   voltage:'3.3V' }
          ]
        };
      } else if (variant.includes("NEO-M9N")) {
        return {
          chip: 'u-blox NEO-M9N',
          pcbColor: '#0f2e4a', /* Deep Slate Navy */
          sensorType: 'GPS',
          w: 155, h: 165,
          hasAntenna: true,
          pins: [
            { name:'VCC', desc:'3.3V - 5V Supply', signal:'power_5v',   voltage:'3.3-5V' },
            { name:'GND', desc:'Ground',           signal:'gnd',        voltage:'0V'     },
            { name:'TX',  desc:'GPS Serial TX',    signal:'uart_tx',    voltage:'3.3V'   },
            { name:'RX',  desc:'GPS Serial RX',    signal:'uart_rx',    voltage:'3.3V'   },
            { name:'SDA', desc:'I2C Data',         signal:'i2c_sda',    voltage:'3.3V'   },
            { name:'SCL', desc:'I2C Clock',        signal:'i2c_scl',    voltage:'3.3V'   },
            { name:'PPS', desc:'Pulse-Per-Second', signal:'gpio',       voltage:'3.3V'   }
          ]
        };
      } else {
        return {
          chip: 'VL53L1X ToF',
          pcbColor: '#1e293b', /* Dark Tactical */
          sensorType: 'TOF',
          w: 110, h: 130,
          pins: [
            { name:'VCC',   desc:'2.8V - 5V Supply',signal:'power_5v',   voltage:'2.8-5V' },
            { name:'GND',   desc:'Ground',          signal:'gnd',        voltage:'0V'     },
            { name:'SDA',   desc:'I2C Data',        signal:'i2c_sda',    voltage:'3.3V'   },
            { name:'SCL',   desc:'I2C Clock',       signal:'i2c_scl',    voltage:'3.3V'   },
            { name:'XSHUT', desc:'Shutdown Active L',signal:'gpio',      voltage:'3.3V'   },
            { name:'GPIO1', desc:'Distance IRQ Out',signal:'gpio',       voltage:'3.3V'   }
          ]
        };
      }
    }
  },

  /* ------------------- POWER, ESCS & MOTORS ------------------- */
  "Power & Actuators": {
    categoryLabel: "Power, ESCs & Motors",
    color: '#15803d',
    borderColor: '#22c55e',
    w: 140, h: 170,
    desc: 'Power storage and propulsion systems: LiPo flight batteries, coreless brushed motors, BLDC brushless motors, and electronic speed controllers.',
    variants: [
      "1S LiPo Battery (3.7V 850mAh)",
      "3S LiPo Battery (11.1V 1500mAh 75C)",
      "8520 Coreless Brushed Motor",
      "2306 2400KV BLDC Motor",
      "30A BLHeli_S Brushless ESC",
      "IRF520 N-MOSFET Module",
      "MT3608 DC-DC Boost Converter"
    ],
    getDetails: function(variant) {
      if (variant.includes("1S LiPo")) {
        return {
          chip: '1S LIPO',
          type: 'LIPO_1S',
          w: 120, h: 170,
          pins: [
            { name:'BAT+', desc:'1S Positive (+3.7V nominal, 4.2V max)', signal:'power_vbat', voltage:'3.7-4.2V' },
            { name:'BAT-', desc:'Battery Ground / Negative',             signal:'gnd',        voltage:'0V'       }
          ]
        };
      } else if (variant.includes("3S LiPo")) {
        return {
          chip: '3S LIPO 75C',
          type: 'LIPO_3S',
          w: 135, h: 215,
          pins: [
            { name:'V+',  desc:'Main Discharge Positive (+11.1V - 12.6V)', signal:'power_vbat', voltage:'11.1-12.6V' },
            { name:'V-',  desc:'Main Discharge Ground / Negative',        signal:'gnd',        voltage:'0V'         },
            { name:'B_G', desc:'Balance Ground',                          signal:'gnd',        voltage:'0V'         },
            { name:'C1',  desc:'Balance Cell 1 Tap (3.7V)',               signal:'power_vbat', voltage:'3.7V'       },
            { name:'C2',  desc:'Balance Cell 2 Tap (7.4V)',               signal:'power_vbat', voltage:'7.4V'       },
            { name:'C3',  desc:'Balance Cell 3 Tap (11.1V)',              signal:'power_vbat', voltage:'11.1V'      }
          ]
        };
      } else if (variant.includes("8520 Coreless")) {
        return {
          chip: '8520 CORELESS',
          type: 'MOTOR_BRUSHED',
          w: 100, h: 185,
          pins: [
            { name:'M+', desc:'Motor Positive (Red / White wire)', signal:'power_vbat', voltage:'3.7V' },
            { name:'M-', desc:'Motor Switched Ground (Blue / Black)', signal:'pwm',      voltage:'0-3.7V'}
          ]
        };
      } else if (variant.includes("2306")) {
        return {
          chip: 'BLDC 2306',
          type: 'MOTOR_BLDC',
          w: 155, h: 175,
          pins: [
            { name:'PH_A', desc:'Phase A Motor Winding', signal:'motor_phase', voltage:'AC 3-Phase' },
            { name:'PH_B', desc:'Phase B Motor Winding', signal:'motor_phase', voltage:'AC 3-Phase' },
            { name:'PH_C', desc:'Phase C Motor Winding', signal:'motor_phase', voltage:'AC 3-Phase' }
          ]
        };
      } else if (variant.includes("BLHeli_S")) {
        return {
          chip: 'BLHELI_S ESC',
          type: 'ESC',
          w: 115, h: 185,
          pins: [
            { name:'BAT+', desc:'DC Battery Positive (2S-4S)', signal:'power_vbat',  voltage:'7.4-16.8V' },
            { name:'GND',  desc:'Power Ground',                signal:'gnd',         voltage:'0V'        },
            { name:'PWM',  desc:'Motor Throttle Signal',       signal:'pwm',         voltage:'3.3-5V'    },
            { name:'M_A',  desc:'Motor Phase A Output',        signal:'motor_phase', voltage:'AC 3-Phase'},
            { name:'M_B',  desc:'Motor Phase B Output',        signal:'motor_phase', voltage:'AC 3-Phase'},
            { name:'M_C',  desc:'Motor Phase C Output',        signal:'motor_phase', voltage:'AC 3-Phase'}
          ]
        };
      } else if (variant.includes("MOSFET")) {
        return {
          chip: 'IRF520 MOSFET',
          type: 'MOSFET',
          pcbColor: '#881337', /* Dark Red */
          w: 115, h: 150,
          pins: [
            { name:'SIG',  desc:'Gate PWM Control Signal',    signal:'pwm',        voltage:'3.3-5V' },
            { name:'VCC',  desc:'Logic Supply (Opto)',        signal:'power_5v',   voltage:'5V'     },
            { name:'GND',  desc:'Common Ground',              signal:'gnd',        voltage:'0V'     },
            { name:'VIN',  desc:'High-Current Load Positive', signal:'power_vbat', voltage:'0-24V'  },
            { name:'VOUT', desc:'Switched Switched Output',   signal:'power_vbat', voltage:'0-24V'  }
          ]
        };
      } else {
        return {
          chip: 'MT3608 BOOST',
          type: 'BOOST_CONVERTER',
          pcbColor: '#1e3a8a', /* Deep Blue */
          w: 120, h: 155,
          pins: [
            { name:'IN+',  desc:'Input Voltage (2V-24V)',      signal:'power_vbat', voltage:'2-24V' },
            { name:'IN-',  desc:'Input Ground',               signal:'gnd',        voltage:'0V'    },
            { name:'OUT+', desc:'Regulated Boost Output (5V)', signal:'power_5v',   voltage:'5.0V'  },
            { name:'OUT-', desc:'Output Ground',              signal:'gnd',        voltage:'0V'    }
          ]
        };
      }
    }
  },

  /* ------------------- RADIO LINKS & TELEMETRY ------------------- */
  "Radio & Telemetry": {
    categoryLabel: "Radio Links & Telemetry",
    color: '#831843',
    borderColor: '#f43f5e',
    w: 130, h: 150,
    desc: 'Ultra-low latency RC control links and telemetry transmitters for long-range drone control.',
    variants: [
      "ExpressLRS 2.4GHz RX",
      "TBS Crossfire Nano RX",
      "nRF24L01+ PA/LNA"
    ],
    getDetails: function(variant) {
      if (variant.includes("ExpressLRS") || variant.includes("Crossfire")) {
        return {
          chip: 'CRSF / ELRS',
          pcbColor: '#1e1e24',
          w: 100, h: 130,
          pins: [
            { name:'5V',  desc:'5V Supply Rail',       signal:'power_5v', voltage:'5.0V' },
            { name:'GND', desc:'Ground',               signal:'gnd',      voltage:'0V'   },
            { name:'TX',  desc:'CRSF Telemetry Output',signal:'uart_tx',  voltage:'3.3V' },
            { name:'RX',  desc:'CRSF RC Command Input',signal:'uart_rx',  voltage:'3.3V' }
          ]
        };
      } else {
        return {
          chip: 'nRF24L01+',
          pcbColor: '#090d14',
          w: 125, h: 165,
          pins: [
            { name:'3V3',  desc:'3.3V Supply (Max 3.6V)', signal:'power_3v3', voltage:'3.3V' },
            { name:'GND',  desc:'Ground',                 signal:'gnd',       voltage:'0V'   },
            { name:'CSN',  desc:'SPI Chip Select',        signal:'spi_cs',    voltage:'3.3V' },
            { name:'CE',   desc:'Chip Enable Transmit',   signal:'gpio',      voltage:'3.3V' },
            { name:'SCK',  desc:'SPI Clock',              signal:'spi_sck',   voltage:'3.3V' },
            { name:'MOSI', desc:'SPI Data In',            signal:'spi_mosi',  voltage:'3.3V' },
            { name:'MISO', desc:'SPI Data Out',           signal:'spi_miso',  voltage:'3.3V' },
            { name:'IRQ',  desc:'Interrupt Request',      signal:'gpio',      voltage:'3.3V' }
          ]
        };
      }
    }
  },

  /* ------------------- DISPLAYS & SIGNALING ------------------- */
  "Displays & Signaling": {
    categoryLabel: "Displays, Buzzers & LEDs",
    color: '#312e81',
    borderColor: '#6366f1',
    w: 140, h: 150,
    desc: 'Visual and acoustic feedback: telemetry OLED screens, lost-model active buzzers, and addressable arm status LEDs.',
    variants: [
      "SSD1306 0.96\" OLED (I2C)",
      "5V Active Drone Buzzer",
      "WS2812B RGB Arm LEDs"
    ],
    getDetails: function(variant) {
      if (variant.includes("SSD1306")) {
        return {
          chip: 'SSD1306 OLED',
          pcbColor: '#181b24',
          w: 135, h: 155,
          pins: [
            { name:'GND', desc:'Ground',         signal:'gnd',       voltage:'0V'     },
            { name:'VCC', desc:'3.3V - 5V Power',signal:'power_5v',  voltage:'3.3-5V' },
            { name:'SCL', desc:'I2C Clock',      signal:'i2c_scl',   voltage:'3.3V'   },
            { name:'SDA', desc:'I2C Data',       signal:'i2c_sda',   voltage:'3.3V'   }
          ]
        };
      } else if (variant.includes("Buzzer")) {
        return {
          chip: '5V BUZZER',
          type: 'BUZZER',
          w: 95, h: 110,
          pins: [
            { name:'+', desc:'Buzzer Positive (+5V)', signal:'power_5v', voltage:'5.0V' },
            { name:'-', desc:'Switched Ground / SIG', signal:'pwm',      voltage:'0-5V' }
          ]
        };
      } else {
        return {
          chip: 'WS2812B ARGB',
          type: 'NEOPIXEL',
          w: 145, h: 85,
          pins: [
            { name:'5V',   desc:'5V Power Supply',     signal:'power_5v', voltage:'5.0V' },
            { name:'GND',  desc:'Ground',              signal:'gnd',      voltage:'0V'   },
            { name:'DIN',  desc:'Digital Pixel In',    signal:'pwm',      voltage:'5.0V' },
            { name:'DOUT', desc:'Data Out to Next Arm',signal:'gpio',     voltage:'5.0V' }
          ]
        };
      }
    }
  }
};

/* Color mapping for wires and pin badges */
const SIGNAL_COLOR = {
  power_5v:   '#ef4444', /* Bright Red */
  power_3v3:  '#f97316', /* Vivid Orange */
  power_vbat: '#dc2626', /* Deep Crimson */
  gnd:        '#475569', /* Slate/Black */
  i2c_sda:    '#00f0c0', /* Electric Cyan */
  i2c_scl:    '#0284c7', /* Sky Blue */
  uart_tx:    '#10b981', /* Bright Green */
  uart_rx:    '#a3e635', /* Lime Green */
  spi_mosi:   '#fbbf24', /* Gold */
  spi_miso:   '#fef08a', /* Pale Yellow */
  spi_sck:    '#f59e0b', /* Amber */
  spi_cs:     '#d97706', /* Dark Amber */
  pwm:        '#ec4899', /* Magenta */
  adc:        '#a855f7', /* Violet */
  gpio:       '#94a3b8', /* Steel */
  motor_phase:'#6366f1'  /* Indigo */
};

/* ═════════════════════════════════════════════════════════════════
   2. GLOBAL STATE & FABRIC INSTANCE
   ═════════════════════════════════════════════════════════════════ */
const canvasWrap = document.getElementById('canvasWrap');
let canvas;
let uidCounter = 0;

const objectsByUid = new Map();
const wires        = [];

let wireMode       = false;
let anchor         = null;      // { obj, pin, pos }
let previewWire    = null;      // temporary curved wire during drag
let selectedWire   = null;
let anchorMarker   = null;

let isPanning      = false;
let panLast        = { x:0, y:0 };

/* ═════════════════════════════════════════════════════════════════
   3. UTILITIES & SCENE TRANSFORM
   ═════════════════════════════════════════════════════════════════ */
function uid() { return 'c_' + (++uidCounter); }

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]
  ));
}

function safeIdent(str) {
  return String(str).toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 20) || 'DEV';
}

function shortPinName(n) {
  return String(n).replace(/^GPIO/i, 'G').replace(/^IO/i, '').slice(0, 5);
}

/* Calculate absolute scene coordinates of a component's pin */
function pinScenePos(obj, pinIndex) {
  const off = obj.pinOffsets && obj.pinOffsets[pinIndex];
  if (!off) return { x: obj.left, y: obj.top };
  const m = obj.calcTransformMatrix();
  return fabric.util.transformPoint(new fabric.Point(off.x, off.y), m);
}

/* ═════════════════════════════════════════════════════════════════
   4. DYNAMIC ENGINEERING GRID SYNC (Tinkercad Style)
   Synchronizes CSS grid background-size and position with Fabric zoom/pan
   ═════════════════════════════════════════════════════════════════ */
function syncEngineeringGrid() {
  if (!canvas || !canvasWrap) return;
  const z = canvas.getZoom();
  const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
  const major = 100 * z;
  const minor = 20 * z;

  /* Modulo offset preserves continuity without huge pixel numbers */
  const posX = vpt[4] % major;
  const posY = vpt[5] % major;
  const posMinorX = vpt[4] % minor;
  const posMinorY = vpt[5] % minor;

  canvasWrap.style.backgroundSize = `${major}px ${major}px, ${major}px ${major}px, ${minor}px ${minor}px, ${minor}px ${minor}px`;
  canvasWrap.style.backgroundPosition = `${posX}px ${posY}px, ${posX}px ${posY}px, ${posMinorX}px ${posMinorY}px, ${posMinorX}px ${posMinorY}px`;
}

/* ═════════════════════════════════════════════════════════════════
   5. CANVAS BOOTSTRAP
   ═════════════════════════════════════════════════════════════════ */
canvas = new fabric.Canvas('droneCanvas', {
  selection: false,
  preserveObjectStacking: true,
  backgroundColor: null,
  fireRightClick: true,
  stopContextMenu: true,
  targetFindTolerance: 8
});

function resizeCanvas() {
  const w = Math.max(200, canvasWrap.clientWidth);
  const h = Math.max(200, canvasWrap.clientHeight);
  if (canvas.getWidth() === w && canvas.getHeight() === h) return;
  canvas.setDimensions({ width: w, height: h });
  syncEngineeringGrid();
  canvas.requestRenderAll();
}
new ResizeObserver(resizeCanvas).observe(canvasWrap);

/* ═════════════════════════════════════════════════════════════════
   6. REALISTIC COMPONENT RENDERING (Detailed PCBs & Hardware)
   ═════════════════════════════════════════════════════════════════ */

/* Layout pin coordinates around the perimeter or headers */
function calculatePinLayout(pinCount, w, h, customType) {
  const out = [];

  if (customType === 'MOTOR_BLDC') {
    /* 3 phase solder pads at bottom */
    const spacing = 24;
    const startX = -((3 - 1) * spacing) / 2;
    const y = h / 2 - 14;
    for (let i = 0; i < 3; i++) {
      out.push({ x: startX + i * spacing, y: y, side: 'bottom' });
    }
    return out;
  }

  if (customType === 'LIPO_1S') {
    /* Red and black battery terminals at top */
    out.push({ x: -22, y: -h / 2 + 14, side: 'top' });
    out.push({ x: 22,  y: -h / 2 + 14, side: 'top' });
    return out;
  }

  if (customType === 'LIPO_3S') {
    /* XT60 main leads at top, balance leads at bottom */
    out.push({ x: -28, y: -h / 2 + 14, side: 'top' });
    out.push({ x: 28,  y: -h / 2 + 14, side: 'top' });
    const balCount = pinCount - 2;
    const spacing = 18;
    const startX = -((balCount - 1) * spacing) / 2;
    for (let i = 0; i < balCount; i++) {
      out.push({ x: startX + i * spacing, y: h / 2 - 14, side: 'bottom' });
    }
    return out;
  }

  if (customType === 'MOTOR_BRUSHED') {
    out.push({ x: -16, y: h / 2 - 16, side: 'bottom' });
    out.push({ x: 16,  y: h / 2 - 16, side: 'bottom' });
    return out;
  }

  if (pinCount <= 6) {
    /* Single in-line header at bottom */
    const spacing = Math.min(22, (w - 32) / Math.max(pinCount, 1));
    const startX = -((pinCount - 1) * spacing) / 2;
    const y = h / 2 - 14;
    for (let i = 0; i < pinCount; i++) {
      out.push({ x: startX + i * spacing, y: y, side: 'bottom' });
    }
  } else {
    /* Dual In-Line Headers (Left and Right sides) */
    const leftCount = Math.ceil(pinCount / 2);
    const rightCount = pinCount - leftCount;
    const spacing = Math.min(20, (h - 48) / Math.max(leftCount, rightCount, 1));
    const startL = -((leftCount - 1) * spacing) / 2;
    const startR = -((rightCount - 1) * spacing) / 2;

    for (let i = 0; i < pinCount; i++) {
      if (i < leftCount) {
        out.push({ x: -w / 2 + 14, y: startL + i * spacing, side: 'left' });
      } else {
        out.push({ x: w / 2 - 14, y: startR + (i - leftCount) * spacing, side: 'right' });
      }
    }
  }
  return out;
}

function addComponent(catKey, variantOverride, posOverride) {
  const catData = DB[catKey];
  if (!catData) return null;

  const variant = variantOverride || catData.variants[0];
  const details = catData.getDetails(variant);
  const w = details.w || catData.w;
  const h = details.h || catData.h;

  const cx = posOverride ? posOverride.x : canvas.getWidth() / 2 + (Math.random() * 80 - 40);
  const cy = posOverride ? posOverride.y : canvas.getHeight() / 2 + (Math.random() * 80 - 40);

  const els = [];
  const pinOffsets = [];
  const pinDefs = details.pins.map(p => Object.assign({}, p));

  /* 3D Drop Shadow */
  const shadow3D = new fabric.Shadow({
    color: 'rgba(0, 0, 0, 0.55)',
    blur: 16,
    offsetX: 4,
    offsetY: 7
  });

  /* ────────────── A. COMPONENT BODY / PCB ────────────── */
  if (details.type === 'MOTOR_BRUSHED') {
    /* Cylindrical brushed motor with silver metallic gradient and gold shaft */
    // Top brass shaft
    els.push(new fabric.Rect({
      width: 6, height: 28, rx: 2, ry: 2,
      fill: '#d97706', stroke: '#92400e', strokeWidth: 1,
      originX: 'center', originY: 'center',
      left: cx, top: cy - h / 2 - 10
    }));
    // Motor metallic cylinder
    const motorBody = new fabric.Rect({
      width: w * 0.72, height: h * 0.75, rx: 12, ry: 12,
      fill: '#cbd5e1', stroke: '#64748b', strokeWidth: 1.8,
      shadow: shadow3D,
      originX: 'center', originY: 'center', left: cx, top: cy - 6
    });
    els.push(motorBody);
    // Cylinder metallic highlights
    els.push(new fabric.Rect({
      width: 8, height: h * 0.68, rx: 2, ry: 2,
      fill: 'rgba(255,255,255,0.45)',
      originX: 'center', originY: 'center', left: cx - 18, top: cy - 6
    }));
    // Black plastic bottom end-cap
    els.push(new fabric.Rect({
      width: w * 0.66, height: 18, rx: 3, ry: 3,
      fill: '#181e26', stroke: '#0f172a', strokeWidth: 1.2,
      originX: 'center', originY: 'center', left: cx, top: cy + h * 0.32
    }));
  } else if (details.type === 'MOTOR_BLDC') {
    /* 2306 BLDC Outrunner Motor */
    // Titanium prop shaft (threaded)
    els.push(new fabric.Rect({
      width: 12, height: 34, rx: 3, ry: 3,
      fill: '#94a3b8', stroke: '#475569', strokeWidth: 1.2,
      originX: 'center', originY: 'center', left: cx, top: cy - h / 2 - 12
    }));
    // Outer motor bell (circular anodized metal)
    els.push(new fabric.Circle({
      radius: w * 0.44,
      fill: '#1e293b', stroke: '#0f172a', strokeWidth: 2,
      shadow: shadow3D,
      originX: 'center', originY: 'center', left: cx, top: cy - 10
    }));
    // Chamfered inner silver ring
    els.push(new fabric.Circle({
      radius: w * 0.38,
      fill: '#0f172a', stroke: '#475569', strokeWidth: 1.5,
      originX: 'center', originY: 'center', left: cx, top: cy - 10
    }));
    // Visible copper stator coils
    const coilAngles = [0, 60, 120, 180, 240, 300];
    coilAngles.forEach(ang => {
      const rad = (ang * Math.PI) / 180;
      const rx = cx + Math.cos(rad) * (w * 0.25);
      const ry = (cy - 10) + Math.sin(rad) * (w * 0.25);
      els.push(new fabric.Circle({
        radius: 7, fill: '#b45309', stroke: '#78350f', strokeWidth: 1,
        originX: 'center', originY: 'center', left: rx, top: ry
      }));
    });
    // Center bell hub
    els.push(new fabric.Circle({
      radius: 14, fill: '#334155', stroke: '#0f172a', strokeWidth: 1.5,
      originX: 'center', originY: 'center', left: cx, top: cy - 10
    }));
  } else if (details.type === 'LIPO_1S') {
    /* 1S Aluminum foil pouch with yellow Kapton band */
    els.push(new fabric.Rect({
      width: w, height: h, rx: 8, ry: 8,
      fill: '#94a3b8', stroke: '#475569', strokeWidth: 2,
      shadow: shadow3D,
      originX: 'center', originY: 'center', left: cx, top: cy
    }));
    // Kapton yellow tape strip
    els.push(new fabric.Rect({
      width: w - 8, height: 26, rx: 2, ry: 2,
      fill: '#d97706', stroke: '#b45309', strokeWidth: 1,
      originX: 'center', originY: 'center', left: cx, top: cy - h * 0.24
    }));
  } else if (details.type === 'LIPO_3S') {
    /* 3S LiPo green pack with cell dividers */
    els.push(new fabric.Rect({
      width: w, height: h, rx: 10, ry: 10,
      fill: '#15803d', stroke: '#14532d', strokeWidth: 2.2,
      shadow: shadow3D,
      originX: 'center', originY: 'center', left: cx, top: cy
    }));
    // 3 Cell division groove lines
    [-h * 0.22, 0, h * 0.22].forEach(yOff => {
      els.push(new fabric.Rect({
        width: w - 16, height: 2,
        fill: '#14532d',
        originX: 'center', originY: 'center', left: cx, top: cy + yOff
      }));
    });
  } else {
    /* Standard Realistic PCB (Dark, Teal, Blue, Purple, Green) */
    const pcbColor = details.pcbColor || catData.color || '#161d28';
    els.push(new fabric.Rect({
      width: w, height: h, rx: 8, ry: 8,
      fill: pcbColor, stroke: '#080d14', strokeWidth: 1.8,
      shadow: shadow3D,
      originX: 'center', originY: 'center', left: cx, top: cy
    }));

    // Inner ground-pour silkscreen trace border
    els.push(new fabric.Rect({
      width: w - 16, height: h - 16, rx: 5, ry: 5,
      fill: 'transparent', stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1,
      originX: 'center', originY: 'center', left: cx, top: cy
    }));

    // Corner anti-vibration mounting holes with copper annular rings
    const mx = w / 2 - 12, my = h / 2 - 12;
    [[-mx, -my], [mx, -my], [-mx, my], [mx, my]].forEach(([ox, oy]) => {
      els.push(new fabric.Circle({
        radius: 4.8, fill: '#b45309', stroke: '#78350f', strokeWidth: 0.8,
        originX: 'center', originY: 'center', left: cx + ox, top: cy + oy
      }));
      els.push(new fabric.Circle({
        radius: 2.6, fill: '#090d14',
        originX: 'center', originY: 'center', left: cx + ox, top: cy + oy
      }));
    });
  }

  /* ────────────── B. INTRICATE HARDWARE DETAILS ────────────── */
  if (details.hasShield) {
    /* Metal RF Shield Can for ESP32 with laser engraving and copper trace antenna */
    // Top copper trace meander antenna
    els.push(new fabric.Rect({
      width: w * 0.72, height: 22, rx: 3, ry: 3,
      fill: '#14171d', stroke: '#d97706', strokeWidth: 1.2,
      originX: 'center', originY: 'center', left: cx, top: cy - h * 0.38
    }));
    // Metal shielding can
    els.push(new fabric.Rect({
      width: w * 0.72, height: h * 0.44, rx: 4, ry: 4,
      fill: '#475569', stroke: '#64748b', strokeWidth: 1.2,
      originX: 'center', originY: 'center', left: cx, top: cy - h * 0.08
    }));
    els.push(new fabric.Text('ESPRESSIF\nESP32-S3', {
      fontSize: 8.5, fontFamily: 'ui-monospace, monospace', fontWeight: 'bold',
      fill: 'rgba(255,255,255,0.5)', textAlign: 'center',
      originX: 'center', originY: 'center', left: cx, top: cy - h * 0.08
    }));
  } else if (details.hasAntenna) {
    /* GPS Ceramic Patch Antenna */
    els.push(new fabric.Rect({
      width: w * 0.65, height: h * 0.48, rx: 4, ry: 4,
      fill: '#d6cbb8', stroke: '#8c8273', strokeWidth: 1.5,
      originX: 'center', originY: 'center', left: cx, top: cy - h * 0.12
    }));
    // Center silver feed pin
    els.push(new fabric.Circle({
      radius: 4, fill: '#94a3b8', stroke: '#475569', strokeWidth: 1,
      originX: 'center', originY: 'center', left: cx, top: cy - h * 0.12
    }));
  } else if (details.sensorType === 'BARO') {
    /* Metallic Barometric Sensor can with pressure aperture */
    els.push(new fabric.Rect({
      width: 32, height: 24, rx: 2, ry: 2,
      fill: '#cbd5e1', stroke: '#64748b', strokeWidth: 1,
      originX: 'center', originY: 'center', left: cx, top: cy - h * 0.14
    }));
    els.push(new fabric.Circle({
      radius: 2.2, fill: '#0f172a',
      originX: 'center', originY: 'center', left: cx - 6, top: cy - h * 0.14
    }));
  } else if (details.type === 'MOSFET') {
    /* TO-220 Transistor with silver metal heatsink tab */
    els.push(new fabric.Rect({
      width: 44, height: 16, rx: 2, ry: 2,
      fill: '#cbd5e1', stroke: '#64748b', strokeWidth: 1,
      originX: 'center', originY: 'center', left: cx, top: cy - h * 0.28
    }));
    els.push(new fabric.Circle({
      radius: 4, fill: '#0f172a',
      originX: 'center', originY: 'center', left: cx, top: cy - h * 0.28
    }));
    els.push(new fabric.Rect({
      width: 44, height: 32, rx: 2, ry: 2,
      fill: '#181e26', stroke: '#0f172a', strokeWidth: 1.2,
      originX: 'center', originY: 'center', left: cx, top: cy - h * 0.08
    }));
  } else if (details.type === 'BOOST_CONVERTER') {
    /* Wire-wound power inductor + blue precision potentiometer */
    // Shielded Inductor
    els.push(new fabric.Circle({
      radius: 16, fill: '#1e293b', stroke: '#b45309', strokeWidth: 2,
      originX: 'center', originY: 'center', left: cx - 22, top: cy - h * 0.14
    }));
    // Blue Trimpot
    els.push(new fabric.Rect({
      width: 28, height: 24, rx: 2, ry: 2,
      fill: '#0284c7', stroke: '#0369a1', strokeWidth: 1.2,
      originX: 'center', originY: 'center', left: cx + 22, top: cy - h * 0.14
    }));
    // Brass adjust screw
    els.push(new fabric.Circle({
      radius: 4, fill: '#fbbf24', stroke: '#b45309', strokeWidth: 1,
      originX: 'center', originY: 'center', left: cx + 22, top: cy - h * 0.14
    }));
  } else if (!details.type) {
    /* Central Microchip (QFP/QFN with solder pin legs) */
    const chipW = Math.min(w * 0.48, 70);
    const chipH = Math.min(h * 0.38, 55);

    // QFP metal solder lead pins along sides
    const leadCount = 6;
    for (let i = 0; i < leadCount; i++) {
      const off = -chipW / 2 + (i + 0.5) * (chipW / leadCount);
      // Top/Bottom leads
      els.push(new fabric.Rect({
        width: 3.5, height: 6, fill: '#94a3b8',
        originX: 'center', originY: 'center', left: cx + off, top: (cy - h * 0.12) - chipH / 2 - 2
      }));
      els.push(new fabric.Rect({
        width: 3.5, height: 6, fill: '#94a3b8',
        originX: 'center', originY: 'center', left: cx + off, top: (cy - h * 0.12) + chipH / 2 + 2
      }));
    }

    // Black epoxy IC package body
    els.push(new fabric.Rect({
      width: chipW, height: chipH, rx: 3, ry: 3,
      fill: '#111827', stroke: '#374151', strokeWidth: 1.2,
      originX: 'center', originY: 'center', left: cx, top: cy - h * 0.12
    }));

    // Pin-1 orientation dimple
    els.push(new fabric.Circle({
      radius: 2.5, fill: '#374151',
      originX: 'center', originY: 'center',
      left: cx - chipW / 2 + 6, top: (cy - h * 0.12) - chipH / 2 + 6
    }));

    // Laser-etched IC Text
    els.push(new fabric.Text(details.chip || 'MCU', {
      fontSize: 7.5, fontFamily: 'ui-monospace, monospace', fontWeight: 'bold',
      fill: 'rgba(255,255,255,0.6)', textAlign: 'center',
      originX: 'center', originY: 'center', left: cx, top: cy - h * 0.12
    }));
  }

  /* ────────────── C. VARIANT DISPLAY TITLE ────────────── */
  const labelText = new fabric.Textbox(variant, {
    width: w - 24,
    fontSize: 10.5,
    fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
    fontWeight: '700',
    fill: '#f0f4f8',
    textAlign: 'center',
    splitByGrapheme: false,
    originX: 'center', originY: 'center',
    left: cx,
    top: cy + (details.type === 'MOTOR_BLDC' ? h * 0.30 : h * 0.14)
  });
  labelText.isLabel = true;
  els.push(labelText);

  /* ────────────── D. GOLDEN PIN-HOLES & ROTATED SILKSCREEN ────────────── */
  const layout = calculatePinLayout(pinDefs.length, w, h, details.type);

  pinDefs.forEach((p, i) => {
    const off = layout[i] || { x:0, y:0, side:'bottom' };
    pinOffsets.push({ x: off.x, y: off.y });

    const px = cx + off.x;
    const py = cy + off.y;

    /* Golden Pad: Square for Pin 1 (standard electronics), Circular for others */
    if (i === 0) {
      els.push(new fabric.Rect({
        width: 8.5, height: 8.5, rx: 1.5, ry: 1.5,
        fill: '#fbbf24', stroke: '#b45309', strokeWidth: 0.9,
        originX: 'center', originY: 'center', left: px, top: py
      }));
    } else {
      els.push(new fabric.Circle({
        radius: 4.2,
        fill: '#fbbf24', stroke: '#b45309', strokeWidth: 0.9,
        originX: 'center', originY: 'center', left: px, top: py
      }));
    }

    /* Inner Dark Drill Hole */
    els.push(new fabric.Circle({
      radius: 1.8, fill: '#090d14',
      originX: 'center', originY: 'center', left: px, top: py
    }));

    /* Vertical / Rotated Crisp Silkscreen Text Labels */
    const isLeft   = off.side === 'left';
    const isRight  = off.side === 'right';
    const isTop    = off.side === 'top';
    const isBottom = off.side === 'bottom';

    let lblX = px;
    let lblY = py;
    let originX = 'center';
    let originY = 'center';

    if (isLeft) {
      lblX = px + 9;
      originX = 'left';
    } else if (isRight) {
      lblX = px - 9;
      originX = 'right';
    } else if (isTop) {
      lblY = py + 10;
      originY = 'top';
    } else if (isBottom) {
      lblY = py - 10;
      originY = 'bottom';
    }

    els.push(new fabric.Text(shortPinName(p.name), {
      fontSize: 7.2,
      fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
      fontWeight: '800',
      fill: '#ffffff',
      originX: originX,
      originY: originY,
      left: lblX,
      top: lblY
    }));
  });

  /* ────────────── E. FABRIC GROUP CREATION ────────────── */
  const group = new fabric.Group(els, {
    left: cx, top: cy,
    originX: 'center', originY: 'center',
    subTargetCheck: false,
    hasControls: true,
    hasBorders: true,
    borderColor: '#00f0c0',
    cornerColor: '#00f0c0',
    cornerStrokeColor: '#09151e',
    cornerSize: 9,
    transparentCorners: false,
    lockScalingFlip: true
  });

  group.uid          = uid();
  group.compCategory = catKey;
  group.compVariant  = variant;
  group.pinDefs      = pinDefs;
  group.pinOffsets   = pinOffsets;
  group.isComponent  = true;

  objectsByUid.set(group.uid, group);
  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.requestRenderAll();

  log(`Spawned ${catKey} → ${variant}`, 'accent');
  autosave();
  return group;
}

function duplicateComponent(obj) {
  if (!obj || !obj.isComponent) return null;
  const dup = addComponent(obj.compCategory, obj.compVariant, {
    x: obj.left + 35,
    y: obj.top + 35
  });
  if (!dup) return null;

  dup.set({ angle: obj.angle, scaleX: obj.scaleX, scaleY: obj.scaleY });
  dup.setCoords();
  canvas.setActiveObject(dup);
  canvas.requestRenderAll();
  log(`Duplicated ${obj.compVariant}.`, 'accent');
  autosave();
  return dup;
}

function rotateComponent(obj) {
  if (!obj || !obj.isComponent) return;
  const nextAngle = (obj.angle + 90) % 360;
  obj.rotate(nextAngle);
  obj.setCoords();
  refreshWires();
  canvas.requestRenderAll();
  autosave();
  log(`Rotated ${obj.compVariant} to ${nextAngle}°.`, 'info');
}

/* ═════════════════════════════════════════════════════════════════
   7. INTERACTIVE WIRING (Tinkercad-Style Smooth Bezier Curves)
   ═════════════════════════════════════════════════════════════════ */
function wireColor(sigA, sigB) {
  return SIGNAL_COLOR[sigA] || SIGNAL_COLOR[sigB] || '#00f0c0';
}

/* Create smooth bezier curve path for wires */
function buildWirePath(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.hypot(dx, dy);

  // Natural catenary droop based on distance
  const sag = Math.min(85, Math.max(25, dist * 0.22));

  // Control points
  const cx1 = p1.x + dx * 0.25;
  const cy1 = p1.y + dy * 0.25 + sag;
  const cx2 = p1.x + dx * 0.75;
  const cy2 = p1.y + dy * 0.75 + sag;

  return `M ${p1.x} ${p1.y} C ${cx1} ${cy1} ${cx2} ${cy2} ${p2.x} ${p2.y}`;
}

function createWire(a, b) {
  /* Prevent duplicate connections between same pin pair */
  const exists = wires.some(w =>
    (w.a.uid === a.obj.uid && w.a.pin === a.pin && w.b.uid === b.obj.uid && w.b.pin === b.pin) ||
    (w.a.uid === b.obj.uid && w.a.pin === b.pin && w.b.uid === a.obj.uid && w.b.pin === a.pin)
  );
  if (exists) {
    log('Those golden pins are already connected.', 'warn');
    return;
  }

  const pa = pinScenePos(a.obj, a.pin);
  const pb = pinScenePos(b.obj, b.pin);

  const sigA = a.obj.pinDefs[a.pin].signal;
  const sigB = b.obj.pinDefs[b.pin].signal;
  const col = wireColor(sigA, sigB);

  const pathStr = buildWirePath(pa, pb);

  const path = new fabric.Path(pathStr, {
    stroke: col,
    strokeWidth: 3.2,
    strokeLineCap: 'round',
    fill: false,
    selectable: false,
    evented: false,
    objectCaching: false,
    hoverCursor: 'pointer',
    shadow: new fabric.Shadow({
      color: 'rgba(0, 0, 0, 0.4)',
      blur: 6,
      offsetX: 1,
      offsetY: 3
    })
  });

  canvas.add(path);
  canvas.sendToBack(path);

  const wireObj = {
    line: path,
    a: { uid: a.obj.uid, pin: a.pin },
    b: { uid: b.obj.uid, pin: b.pin }
  };
  wires.push(wireObj);

  const pinAName = a.obj.pinDefs[a.pin].name;
  const pinBName = b.obj.pinDefs[b.pin].name;
  const verdict = signalCompat(sigA, sigB);

  const msg = `Wire: ${a.obj.compVariant} [${pinAName}] ↔ ${b.obj.compVariant} [${pinBName}]`;
  if (verdict.status === 'ok') {
    log(`🔗 Connected: ${msg}`, 'ok');
  } else if (verdict.status === 'warn') {
    log(`⚠️ Warning: ${msg} (${verdict.reason})`, 'warn');
  } else {
    log(`❌ Critical Mismatch: ${msg} (${verdict.reason})`, 'error');
  }

  refreshWires();
  renderWiringMap();
  autosave();
}

function refreshWires() {
  wires.forEach(w => {
    const oa = objectsByUid.get(w.a.uid);
    const ob = objectsByUid.get(w.b.uid);
    if (!oa || !ob) return;
    const pa = pinScenePos(oa, w.a.pin);
    const pb = pinScenePos(ob, w.b.pin);
    const pathStr = buildWirePath(pa, pb);

    const tempPath = new fabric.Path(pathStr);
    w.line.set({
      path: tempPath.path,
      width: tempPath.width,
      height: tempPath.height,
      left: tempPath.left,
      top: tempPath.top
    });
    w.line.setCoords();
  });
  canvas.requestRenderAll();
}

function destroyWiresOf(uid) {
  for (let i = wires.length - 1; i >= 0; i--) {
    const w = wires[i];
    if (w.a.uid === uid || w.b.uid === uid) {
      canvas.remove(w.line);
      if (selectedWire === w) selectedWire = null;
      wires.splice(i, 1);
    }
  }
}

/* Wire hit-testing */
function distanceToSegment(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = a.x + t * dx, py = a.y + t * dy;
  return Math.hypot(p.x - px, p.y - py);
}

function findWireNear(point, tolerance) {
  let best = null, bestD = tolerance;
  wires.forEach(w => {
    const oa = objectsByUid.get(w.a.uid);
    const ob = objectsByUid.get(w.b.uid);
    if (!oa || !ob) return;
    const pa = pinScenePos(oa, w.a.pin);
    const pb = pinScenePos(ob, w.b.pin);
    const d = distanceToSegment(point, pa, pb);
    if (d < bestD) { bestD = d; best = w; }
  });
  return best;
}

function selectWire(w) {
  if (selectedWire && selectedWire.line) {
    selectedWire.line.set({ strokeWidth: 3.2, shadow: null });
  }
  selectedWire = w;
  if (w) {
    w.line.set({
      strokeWidth: 5.5,
      shadow: new fabric.Shadow({ color: '#00f0c0', blur: 12, offsetX: 0, offsetY: 0 })
    });
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    showWireProperties(w);
  } else {
    canvas.requestRenderAll();
    clearProperties();
  }
}

/* ═════════════════════════════════════════════════════════════════
   8. PIN HIT-TESTING & WIRE MODE INTERACTION
   ═════════════════════════════════════════════════════════════════ */
const pinTooltipEl   = document.getElementById('pinTooltip');
const pinTitleEl     = document.getElementById('pinTooltipTitle');
const pinTypeEl      = document.getElementById('pinTooltipType');

function findPinAt(point) {
  const tol = 16 / canvas.getZoom();
  let best = null, bestD = tol;

  canvas.getObjects().forEach(o => {
    if (!o.pinOffsets || !o.pinDefs) return;
    for (let i = 0; i < o.pinOffsets.length; i++) {
      const pos = pinScenePos(o, i);
      const d = Math.hypot(pos.x - point.x, pos.y - point.y);
      if (d < bestD) { bestD = d; best = { obj:o, pin:i, pos }; }
    }
  });
  return best;
}

function showAnchorMarker(pos) {
  removeAnchorMarker();
  anchorMarker = new fabric.Circle({
    radius: 9,
    fill: 'rgba(0, 240, 192, 0.25)',
    stroke: '#00f0c0',
    strokeWidth: 2.2,
    originX: 'center', originY: 'center',
    left: pos.x, top: pos.y,
    selectable: false, evented: false
  });
  canvas.add(anchorMarker);
  canvas.requestRenderAll();
}

function removeAnchorMarker() {
  if (anchorMarker) { canvas.remove(anchorMarker); anchorMarker = null; }
  if (previewWire) { canvas.remove(previewWire); previewWire = null; }
  canvas.requestRenderAll();
}

function handlePinClick(hit) {
  if (!anchor) {
    anchor = hit;
    showAnchorMarker(hit.pos);
    log(`Anchored Wire at: ${hit.obj.compVariant} [${hit.obj.pinDefs[hit.pin].name}]`, 'info');
    return;
  }
  if (anchor.obj === hit.obj && anchor.pin === hit.pin) {
    anchor = null;
    removeAnchorMarker();
    log('Wire connection cancelled.', 'dim');
    return;
  }
  createWire(anchor, hit);
  anchor = null;
  removeAnchorMarker();
}

/* ═════════════════════════════════════════════════════════════════
   9. CANVAS EVENTS (Pan, Zoom, Drag, Drop)
   ═════════════════════════════════════════════════════════════════ */
canvas.on('mouse:down', function (opt) {
  const e = opt.e;

  /* Right-click quick duplicate */
  if (e.button === 2) {
    if (opt.target && opt.target.isComponent) duplicateComponent(opt.target);
    return;
  }

  /* Panning: Alt+Drag or Middle-Click */
  if (e.altKey || e.button === 1) {
    isPanning = true;
    panLast = { x: e.clientX, y: e.clientY };
    canvas.setCursor('grabbing');
    return;
  }

  const p = canvas.getPointer(e);

  /* Wire Mode: Pin Connection */
  if (wireMode) {
    const hit = findPinAt(p);
    if (hit) {
      handlePinClick(hit);
      return;
    }
  }

  /* Empty Space: Select wire */
  if (!opt.target) {
    const w = findWireNear(p, 10 / canvas.getZoom());
    selectWire(w || null);
  } else {
    if (selectedWire) selectWire(null);
  }
});

canvas.on('mouse:move', function (opt) {
  const e = opt.e;

  /* Panning update */
  if (isPanning) {
    const vpt = canvas.viewportTransform;
    vpt[4] += e.clientX - panLast.x;
    vpt[5] += e.clientY - panLast.y;
    canvas.requestRenderAll();
    syncEngineeringGrid();
    panLast = { x: e.clientX, y: e.clientY };
    return;
  }

  const p = canvas.getPointer(e);
  const hit = findPinAt(p);

  /* Live Tooltip when hovering pins */
  if (hit) {
    const pin = hit.obj.pinDefs[hit.pin];
    pinTitleEl.textContent = `${hit.obj.compVariant} · ${pin.name}`;
    pinTypeEl.textContent = `${pin.signal.toUpperCase()} (${pin.voltage || '3.3V'}) — ${pin.desc}`;
    pinTooltipEl.style.left = `${e.offsetX}px`;
    pinTooltipEl.style.top = `${e.offsetY - 14}px`;
    pinTooltipEl.hidden = false;
    canvas.setCursor('crosshair');
  } else {
    pinTooltipEl.hidden = true;
    if (!wireMode) canvas.setCursor('default');
  }

  /* Live Wire Drag Preview */
  if (wireMode && anchor) {
    const pa = pinScenePos(anchor.obj, anchor.pin);
    const pb = hit ? hit.pos : p;
    const pathStr = buildWirePath(pa, pb);

    if (!previewWire) {
      previewWire = new fabric.Path(pathStr, {
        stroke: '#00f0c0',
        strokeWidth: 2.6,
        strokeDashArray: [6, 4],
        fill: false,
        selectable: false,
        evented: false
      });
      canvas.add(previewWire);
    } else {
      const tempPath = new fabric.Path(pathStr);
      previewWire.set({
        path: tempPath.path,
        width: tempPath.width,
        height: tempPath.height,
        left: tempPath.left,
        top: tempPath.top
      });
      previewWire.setCoords();
    }
    canvas.requestRenderAll();
  }

  refreshWires();
});

canvas.on('mouse:up', function () {
  if (isPanning) {
    isPanning = false;
    canvas.setCursor('default');
  }
});

canvas.on('mouse:wheel', function (opt) {
  const e = opt.e;
  let zoom = canvas.getZoom() * Math.pow(0.999, e.deltaY);
  zoom = Math.min(3.5, Math.max(0.3, zoom));
  canvas.zoomToPoint(new fabric.Point(e.offsetX, e.offsetY), zoom);
  syncEngineeringGrid();
  e.preventDefault();
  e.stopPropagation();
});

canvas.on('object:moving', refreshWires);
canvas.on('object:scaling', refreshWires);
canvas.on('object:rotating', refreshWires);
canvas.on('object:modified', () => { refreshWires(); autosave(); });

/* ═════════════════════════════════════════════════════════════════
   10. SELECTION & DYNAMIC PROPERTIES INSPECTOR
   ═════════════════════════════════════════════════════════════════ */
const emptyPanel       = document.getElementById('emptyPanel');
const propsPanel       = document.getElementById('propsPanel');
const wirePropsPanel   = document.getElementById('wirePropsPanel');
const selectionBadge   = document.getElementById('selectionTypeBadge');
const compNameEl       = document.getElementById('selectedCompName');
const categorySel      = document.getElementById('compCategory');
const variantSel       = document.getElementById('compVariant');
const compDescEl       = document.getElementById('compDesc');
const pinCountBadge    = document.getElementById('pinCountBadge');
const pinTableBody     = document.getElementById('pinTableBody');

const wireDescText     = document.getElementById('wireDescText');
const wireStatusBadge  = document.getElementById('wireStatusBadge');
const wireTableBody    = document.getElementById('wireTableBody');

/* Populate categories in props dropdown once */
Object.keys(DB).forEach(cat => {
  const o = document.createElement('option');
  o.value = cat;
  o.textContent = DB[cat].categoryLabel || cat;
  categorySel.appendChild(o);
});

function clearProperties() {
  emptyPanel.hidden = false;
  propsPanel.hidden = true;
  wirePropsPanel.hidden = true;
  selectionBadge.textContent = 'None';
  selectionBadge.style.color = 'var(--text-muted)';
}

function showComponentProperties(obj) {
  emptyPanel.hidden = true;
  propsPanel.hidden = false;
  wirePropsPanel.hidden = true;

  selectionBadge.textContent = 'Component';
  selectionBadge.style.color = 'var(--accent-cyan)';

  const catData = DB[obj.compCategory];
  compNameEl.textContent = obj.compVariant;
  categorySel.value = obj.compCategory;

  /* Variant dropdown */
  variantSel.disabled = false;
  variantSel.innerHTML = '';
  catData.variants.forEach(v => {
    const o = document.createElement('option');
    o.value = v; o.textContent = v;
    variantSel.appendChild(o);
  });
  variantSel.value = obj.compVariant;

  compDescEl.textContent = catData.desc;
  pinCountBadge.textContent = `${obj.pinDefs.length} pins`;

  /* Render detailed pinout table */
  pinTableBody.innerHTML = '';
  obj.pinDefs.forEach((p, idx) => {
    const tr = document.createElement('tr');
    const color = SIGNAL_COLOR[p.signal] || '#64748b';
    tr.innerHTML = `
      <td><span class="pin-tag" style="border-left:3px solid ${color}">${escapeHtml(p.name)}</span></td>
      <td><span class="sig-badge" style="background:${color}22;color:${color}">${escapeHtml(p.signal)}</span></td>
      <td style="color:var(--text-secondary)">${escapeHtml(p.desc)} (${escapeHtml(p.voltage || '3.3V')})</td>
    `;
    pinTableBody.appendChild(tr);
  });
}

function showWireProperties(w) {
  emptyPanel.hidden = true;
  propsPanel.hidden = true;
  wirePropsPanel.hidden = false;

  selectionBadge.textContent = 'Wire';
  selectionBadge.style.color = '#38bdf8';

  const oa = objectsByUid.get(w.a.uid);
  const ob = objectsByUid.get(w.b.uid);
  if (!oa || !ob) return;

  const pa = oa.pinDefs[w.a.pin];
  const pb = ob.pinDefs[w.b.pin];

  wireDescText.textContent = `${oa.compVariant} [${pa.name}]  ↔  ${ob.compVariant} [${pb.name}]`;

  const verdict = signalCompat(pa.signal, pb.signal);
  wireStatusBadge.textContent = verdict.status.toUpperCase();
  wireStatusBadge.style.background =
    verdict.status === 'ok' ? 'var(--status-ok-soft)' :
    verdict.status === 'warn' ? 'var(--status-warn-soft)' : 'var(--status-error-soft)';
  wireStatusBadge.style.color =
    verdict.status === 'ok' ? 'var(--status-ok)' :
    verdict.status === 'warn' ? 'var(--status-warn)' : 'var(--status-error)';

  wireTableBody.innerHTML = `
    <tr><td><strong>Source Pin</strong></td><td>${escapeHtml(oa.compVariant)} · ${escapeHtml(pa.name)} (${escapeHtml(pa.signal)})</td></tr>
    <tr><td><strong>Target Pin</strong></td><td>${escapeHtml(ob.compVariant)} · ${escapeHtml(pb.name)} (${escapeHtml(pb.signal)})</td></tr>
    <tr><td><strong>Voltage Check</strong></td><td>${escapeHtml(pa.voltage || '3.3V')} ↔ ${escapeHtml(pb.voltage || '3.3V')}</td></tr>
    <tr><td><strong>Verdict</strong></td><td>${escapeHtml(verdict.reason)}</td></tr>
  `;
}

canvas.on('selection:created', e => {
  const obj = e.selected && e.selected[0];
  if (obj && obj.isComponent) { selectWire(null); showComponentProperties(obj); }
});
canvas.on('selection:updated', e => {
  const obj = e.selected && e.selected[0];
  if (obj && obj.isComponent) { selectWire(null); showComponentProperties(obj); }
});
canvas.on('selection:cleared', () => {
  if (!selectedWire) clearProperties();
});

/* Live Variant Swap */
variantSel.addEventListener('change', e => {
  const obj = canvas.getActiveObject();
  if (!obj || !obj.isComponent) return;
  const newVariant = e.target.value;
  obj.compVariant = newVariant;

  const tb = obj.getObjects().find(o => o.isLabel);
  if (tb) {
    tb.set({ text: newVariant });
    obj.setCoords();
    canvas.requestRenderAll();
  }
  compNameEl.textContent = newVariant;
  renderWiringMap();
  autosave();
  log(`Updated model variant → ${newVariant}`, 'info');
});

document.getElementById('duplicateBtn').addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (obj && obj.isComponent) duplicateComponent(obj);
});

document.getElementById('rotateBtn').addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (obj && obj.isComponent) rotateComponent(obj);
});

/* ═════════════════════════════════════════════════════════════════
   11. DELETION & CANVAS RESET
   ═════════════════════════════════════════════════════════════════ */
function deleteSelection() {
  if (selectedWire) {
    canvas.remove(selectedWire.line);
    const i = wires.indexOf(selectedWire);
    if (i >= 0) wires.splice(i, 1);
    selectedWire = null;
    clearProperties();
    renderWiringMap();
    autosave();
    log('Wire connection removed.', 'warn');
    return;
  }

  const obj = canvas.getActiveObject();
  if (!obj || !obj.isComponent) return;

  if (anchor && anchor.obj === obj) { anchor = null; removeAnchorMarker(); }

  destroyWiresOf(obj.uid);
  objectsByUid.delete(obj.uid);
  canvas.remove(obj);
  canvas.discardActiveObject();
  clearProperties();
  refreshWires();
  renderWiringMap();
  autosave();
  log(`Deleted ${obj.compVariant}.`, 'warn');
}

document.getElementById('deleteBtn').addEventListener('click', deleteSelection);
document.getElementById('deleteWireBtn').addEventListener('click', deleteSelection);

document.getElementById('clearBtn').addEventListener('click', () => {
  const hasContent = canvas.getObjects().some(o => o.isComponent);
  if (hasContent && !window.confirm('Clear all drone electronics and wiring from the canvas?')) return;

  canvas.clear();
  canvas.backgroundColor = null;
  objectsByUid.clear();
  wires.length = 0;
  selectedWire = null;
  anchor = null;
  removeAnchorMarker();
  clearProperties();
  syncEngineeringGrid();
  renderWiringMap();
  autosave();
  log('Canvas cleared.', 'warn');
});

window.addEventListener('keydown', e => {
  const tag = (document.activeElement || {}).tagName;
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

  if (e.key === 'd' || e.key === 'D') {
    if (e.ctrlKey || e.metaKey || !e.ctrlKey) {
      e.preventDefault();
      const obj = canvas.getActiveObject();
      if (obj && obj.isComponent) duplicateComponent(obj);
      return;
    }
  }
  if (e.key === 'r' || e.key === 'R') {
    e.preventDefault();
    const obj = canvas.getActiveObject();
    if (obj && obj.isComponent) rotateComponent(obj);
    return;
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    deleteSelection();
  }
  if (e.key === 'Escape') {
    anchor = null;
    removeAnchorMarker();
    selectWire(null);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }
});

/* ═════════════════════════════════════════════════════════════════
   12. HARDWARE LIBRARY FILTERING & SEARCH
   ═════════════════════════════════════════════════════════════════ */
const componentListEl = document.getElementById('componentList');
const searchBoxEl     = document.getElementById('searchBox');
const categoryFilterEl= document.getElementById('categoryFilter');
const libraryCountEl  = document.getElementById('libraryCount');

function renderLibrary() {
  const q = (searchBoxEl.value || '').trim().toLowerCase();
  const selectedCat = categoryFilterEl.value;
  componentListEl.innerHTML = '';

  let totalItems = 0;
  let shownItems = 0;

  Object.keys(DB).forEach(cat => {
    const data = DB[cat];
    totalItems += data.variants.length;

    if (selectedCat !== 'ALL' && selectedCat !== cat) return;

    const catMatches = (data.categoryLabel || cat).toLowerCase().includes(q);
    const matchingVariants = q
      ? data.variants.filter(v => v.toLowerCase().includes(q))
      : data.variants;

    if (!catMatches && matchingVariants.length === 0) return;

    const group = document.createElement('div');
    group.className = 'cat-group';

    const title = document.createElement('div');
    title.className = 'cat-title';
    title.innerHTML = `
      <span>${escapeHtml(data.categoryLabel || cat)}</span>
      <span class="cat-badge">${matchingVariants.length}</span>
    `;
    group.appendChild(title);

    matchingVariants.forEach(v => {
      shownItems++;
      const item = document.createElement('div');
      item.className = 'comp-item';
      item.innerHTML = `
        <div class="comp-item-left">
          <div class="comp-color-dot" style="background:${data.color}"></div>
          <div class="comp-item-info">
            <span class="name">${escapeHtml(v)}</span>
            <span class="sub">${escapeHtml(data.desc.slice(0, 48))}…</span>
          </div>
        </div>
        <div class="add-btn" title="Add to Canvas">+</div>
      `;
      item.addEventListener('click', () => addComponent(cat, v));
      group.appendChild(item);
    });

    componentListEl.appendChild(group);
  });

  libraryCountEl.textContent = `${shownItems} items`;

  if (shownItems === 0) {
    componentListEl.innerHTML = '<div class="no-results">No matching drone hardware found.</div>';
  }
}

searchBoxEl.addEventListener('input', renderLibrary);
categoryFilterEl.addEventListener('change', renderLibrary);

/* ═════════════════════════════════════════════════════════════════
   13. HEADER & TOOLBAR ACTIONS
   ═════════════════════════════════════════════════════════════════ */
const wireModeBtn = document.getElementById('wireModeBtn');

wireModeBtn.addEventListener('click', () => {
  wireMode = !wireMode;
  wireModeBtn.classList.toggle('on', wireMode);
  wireModeBtn.setAttribute('aria-pressed', String(wireMode));
  wireModeBtn.textContent = wireMode ? '🔌 Wire Mode: ON' : '🔌 Wire Mode: OFF';
  if (!wireMode) {
    anchor = null;
    removeAnchorMarker();
    canvas.setCursor('default');
  }
  log(wireMode
    ? 'Wire Mode ON — Click a golden pin on any module, then click a target pin to attach a wire.'
    : 'Wire Mode OFF.', wireMode ? 'accent' : 'dim');
});

document.getElementById('toggleLeftBtn').addEventListener('click', e => {
  const el = document.getElementById('leftSidebar');
  el.classList.toggle('collapsed');
  e.currentTarget.setAttribute('aria-expanded', String(!el.classList.contains('collapsed')));
  setTimeout(resizeCanvas, 280);
});

document.getElementById('toggleRightBtn').addEventListener('click', e => {
  const el = document.getElementById('rightSidebar');
  el.classList.toggle('collapsed');
  e.currentTarget.setAttribute('aria-expanded', String(!el.classList.contains('collapsed')));
  setTimeout(resizeCanvas, 280);
});

/* Canvas Zoom Controls */
document.getElementById('zoomInBtn').addEventListener('click', () => {
  let z = Math.min(3.5, canvas.getZoom() * 1.25);
  canvas.zoomToPoint(new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2), z);
  syncEngineeringGrid();
});

document.getElementById('zoomOutBtn').addEventListener('click', () => {
  let z = Math.max(0.3, canvas.getZoom() * 0.8);
  canvas.zoomToPoint(new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2), z);
  syncEngineeringGrid();
});

document.getElementById('zoomFitBtn').addEventListener('click', () => {
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  canvas.setZoom(1);
  syncEngineeringGrid();
  canvas.requestRenderAll();
  log('Canvas zoom reset to 100%.', 'dim');
});

document.getElementById('resetViewBtn').addEventListener('click', () => {
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  canvas.setZoom(1);
  syncEngineeringGrid();
  canvas.requestRenderAll();
  log('Canvas view centered.', 'dim');
});

/* Theme Toggle */
const themeBtn = document.getElementById('themeToggleBtn');
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  themeBtn.textContent = isLight ? '🌙' : '☀️';
  themeBtn.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
  syncEngineeringGrid();
});

/* Tabs Switching */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const target = document.getElementById(tab.dataset.target);
    if (target) target.classList.add('active');
  });
});

function switchTab(id) {
  const btn = document.querySelector(`.tab[data-target="${id}"]`);
  if (btn) btn.click();
}

/* ═════════════════════════════════════════════════════════════════
   14. CONSOLE LOGGING
   ═════════════════════════════════════════════════════════════════ */
const consoleEl     = document.getElementById('consoleOutput');
const logCountBadge = document.getElementById('logCountBadge');
let logCounter = 0;

function log(message, type) {
  logCounter++;
  logCountBadge.textContent = String(logCounter);
  const t = new Date().toLocaleTimeString('en-GB', { hour12: false });
  const cls = 'log-' + (type || 'info');
  consoleEl.innerHTML += `<span class="log-dim">[${t}]</span> <span class="${cls}">${escapeHtml(message)}</span>\n`;
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

/* ═════════════════════════════════════════════════════════════════
   15. ELECTRICAL RULE & DRONE ARCHITECTURE VALIDATION ENGINE
   ═════════════════════════════════════════════════════════════════ */
function signalCompat(a, b) {
  if (!a || !b) return { status:'unknown', reason:'Unspecified signal type' };

  const isPowA = a.startsWith('power');
  const isPowB = b.startsWith('power');
  const isGndA = a === 'gnd';
  const isGndB = b === 'gnd';

  /* 1. FATAL SHORT CIRCUIT: Positive Power Rail directly to Ground */
  if ((isPowA && isGndB) || (isPowB && isGndA)) {
    return { status:'error', reason:'FATAL SHORT CIRCUIT: Positive power rail connected directly to GND!' };
  }

  /* 2. GROUND TO GROUND */
  if (isGndA && isGndB) {
    return { status:'ok', reason:'Common Ground reference' };
  }

  /* 3. POWER TO POWER (Voltage rail check) */
  if (isPowA && isPowB) {
    if (a === b) return { status:'ok', reason:'Matching power rail' };
    if ((a === 'power_5v' && b === 'power_3v3') || (a === 'power_3v3' && b === 'power_5v')) {
      return { status:'warn', reason:'Voltage mismatch: 5.0V tied directly to 3.3V rail without regulation.' };
    }
    if (a === 'power_vbat' || b === 'power_vbat') {
      return { status:'warn', reason:'Direct high voltage Battery VBat connection to regulated rail.' };
    }
  }

  /* 4. UART (TX must connect to RX) */
  if (a.startsWith('uart') && b.startsWith('uart')) {
    if ((a === 'uart_tx' && b === 'uart_rx') || (a === 'uart_rx' && b === 'uart_tx')) {
      return { status:'ok', reason:'Valid UART cross-coupling (TX → RX)' };
    }
    return { status:'error', reason:'UART Bus Contention: TX must connect to RX; direct TX-to-TX or RX-to-RX detected.' };
  }

  /* 5. I2C (SDA to SDA, SCL to SCL) */
  if (a.startsWith('i2c') && b.startsWith('i2c')) {
    if (a === b) return { status:'ok', reason:'Valid I2C synchronous bus connection' };
    return { status:'error', reason:'I2C Bus Conflict: SDA must connect to SDA, SCL to SCL.' };
  }

  /* 6. SPI */
  if (a.startsWith('spi') && b.startsWith('spi')) {
    if (a === b) return { status:'ok', reason:'Matching SPI line' };
    return { status:'warn', reason:'Unmatched SPI bus lines' };
  }

  /* 7. PWM (MCU PWM to ESC / Servo / Motor Driver) */
  if (a === 'pwm' && b === 'pwm') {
    return { status:'ok', reason:'PWM signal path' };
  }

  /* 8. Motor Phase (ESC to BLDC Motor) */
  if (a === 'motor_phase' && b === 'motor_phase') {
    return { status:'ok', reason:'3-Phase BLDC motor phase connection' };
  }

  /* Non-power connected to power rail */
  if ((isPowA || isGndA) && !(isPowB || isGndB)) {
    return { status:'warn', reason:'Signal pin tied directly to power/ground rail.' };
  }
  if ((isPowB || isGndB) && !(isPowA || isGndA)) {
    return { status:'warn', reason:'Signal pin tied directly to power/ground rail.' };
  }

  return { status:'ok', reason:'General compatible signal interconnection' };
}

function validateCircuit() {
  switchTab('consoleOutput');
  const comps = canvas.getObjects().filter(o => o.isComponent);
  const issues = [];

  log('──────────────────────────────────────────────────────', 'dim');
  log(`⚡ Running AeroForge Drone Electrical DRC (${comps.length} modules, ${wires.length} wires)…`, 'accent');

  /* Rule 1: Flight Controller MCU Check */
  const mcus = comps.filter(o => o.compCategory === 'Microcontrollers');
  if (mcus.length === 0) {
    issues.push({ level:'error', text:'No Flight Controller detected. Add an STM32, ESP32, or Arduino.' });
  } else if (mcus.length > 1) {
    issues.push({ level:'warn', text:`${mcus.length} flight controllers on canvas. Standard drone builds use a single primary FC.` });
  }
  const mcu = mcus[0];

  /* Rule 2: Wire Signal Compatibility Check */
  wires.forEach(w => {
    const oa = objectsByUid.get(w.a.uid);
    const ob = objectsByUid.get(w.b.uid);
    if (!oa || !ob) return;

    const pa = oa.pinDefs[w.a.pin];
    const pb = ob.pinDefs[w.b.pin];
    const verdict = signalCompat(pa.signal, pb.signal);

    const desc = `${oa.compVariant} [${pa.name}] ↔ ${ob.compVariant} [${pb.name}]`;
    if (verdict.status === 'error') {
      issues.push({ level:'error', text:`${desc}: ${verdict.reason}` });
    } else if (verdict.status === 'warn') {
      issues.push({ level:'warn', text:`${desc}: ${verdict.reason}` });
    }
  });

  /* Rule 3: Peripheral Power & Ground Verification */
  comps.forEach(obj => {
    if (obj === mcu) return;
    if (obj.compCategory === 'Power & Actuators' && (obj.compVariant.includes('LiPo') || obj.compVariant.includes('Motor'))) return;

    const connected = new Set();
    wires.forEach(w => {
      if (w.a.uid === obj.uid) connected.add(obj.pinDefs[w.a.pin].signal);
      if (w.b.uid === obj.uid) connected.add(obj.pinDefs[w.b.pin].signal);
    });

    if (connected.size === 0) {
      issues.push({ level:'warn', text:`${obj.compVariant} is unrouted on the canvas.` });
      return;
    }

    const hasPower = connected.has('power_5v') || connected.has('power_3v3') || connected.has('power_vbat');
    const hasGnd   = connected.has('gnd');

    if (!hasPower) issues.push({ level:'warn', text:`${obj.compVariant} has no VCC/Power connection.` });
    if (!hasGnd)   issues.push({ level:'warn', text:`${obj.compVariant} has no GND return path.` });
  });

  /* Rule 4: Actuator & Motor Output Verification */
  const motors = comps.filter(o => o.compCategory === 'Power & Actuators' && (o.compVariant.includes('Motor') || o.compVariant.includes('ESC')));
  if (motors.length > 0 && mcu) {
    const mcuPwmCount = wires.filter(w => {
      const oa = objectsByUid.get(w.a.uid);
      const ob = objectsByUid.get(w.b.uid);
      if (oa === mcu && mcu.pinDefs[w.a.pin].signal === 'pwm') return true;
      if (ob === mcu && mcu.pinDefs[w.b.pin].signal === 'pwm') return true;
      return false;
    }).length;

    if (mcuPwmCount === 0) {
      issues.push({ level:'warn', text:'Propulsion actuators exist, but no PWM motor lines are wired from the Flight Controller.' });
    }
  }

  /* Summary Report */
  const errors = issues.filter(i => i.level === 'error');
  const warns  = issues.filter(i => i.level === 'warn');

  if (issues.length === 0) {
    log('✅ Circuit DRC Passed: Clean electrical layout with zero bus violations.', 'ok');
  } else {
    issues.forEach(i => {
      log((i.level === 'error' ? '❌ ERROR: ' : '⚠️ WARN: ') + i.text, i.level);
    });
    log(`Result: ${errors.length} error(s), ${warns.length} warning(s).`, errors.length ? 'error' : 'warn');
  }

  return { errors, warns, mcu };
}

document.getElementById('validateBtn').addEventListener('click', validateCircuit);

/* ═════════════════════════════════════════════════════════════════
   16. ARDUINO C++ FIRMWARE GENERATOR (.ino)
   ═════════════════════════════════════════════════════════════════ */
const DRIVER_TEMPLATES = [
  {
    match: /MPU-?6050/i,
    name: 'MPU6050 6-Axis IMU',
    headers: ['#include <Wire.h>', '#include <Adafruit_MPU6050.h>', '#include <Adafruit_Sensor.h>'],
    decl: 'Adafruit_MPU6050 imu;',
    setup: [
      '// --- Initialize MPU-6050 Gyro + Accel ---',
      'if (!imu.begin()) {',
      '  Serial.println(F("[ERROR] MPU6050 IMU not detected on I2C bus!"));',
      '} else {',
      '  Serial.println(F("[OK] MPU6050 IMU initialized successfully."));',
      '  imu.setAccelerometerRange(MPU6050_RANGE_8_G);',
      '  imu.setGyroRange(MPU6050_RANGE_500_DEG);',
      '  imu.setFilterBandwidth(MPU6050_BAND_21_HZ);',
      '}'
    ],
    loop: [
      '// Read 6-DOF IMU attitude data',
      'sensors_event_t a, g, temp;',
      'imu.getEvent(&a, &g, &temp);',
      'float pitchRate = g.gyro.x;',
      'float rollRate  = g.gyro.y;',
      'float yawRate   = g.gyro.z;'
    ]
  },
  {
    match: /BMI270/i,
    name: 'Bosch BMI270 Ultra-Low Noise IMU',
    headers: ['#include <Wire.h>', '#include <SparkFun_BMI270_Arduino_Library.h>'],
    decl: 'BMI270 imu;',
    setup: [
      '// --- Initialize BMI270 Drone IMU ---',
      'int8_t bmiErr = imu.beginI2C();',
      'if (bmiErr != BMI2_OK) {',
      '  Serial.println(F("[ERROR] BMI270 IMU failed to initialize!"));',
      '} else {',
      '  Serial.println(F("[OK] BMI270 IMU active at 400kHz."));',
      '}'
    ],
    loop: [
      '// Read BMI270 flight dynamics',
      'imu.getSensorData();',
      'float gyroX = imu.data.gyroX;',
      'float gyroY = imu.data.gyroY;',
      'float gyroZ = imu.data.gyroZ;'
    ]
  },
  {
    match: /BMP280/i,
    name: 'BMP280 Barometer (Altitude Hold)',
    headers: ['#include <Wire.h>', '#include <Adafruit_BMP280.h>'],
    decl: 'Adafruit_BMP280 baro;',
    setup: [
      '// --- Initialize BMP280 Barometer ---',
      'if (!baro.begin(0x76)) {',
      '  Serial.println(F("[ERROR] BMP280 barometer not detected at 0x76!"));',
      '} else {',
      '  Serial.println(F("[OK] BMP280 Barometer online."));',
      '  baro.setSampling(Adafruit_BMP280::MODE_NORMAL,',
      '                  Adafruit_BMP280::SAMPLING_X2,',
      '                  Adafruit_BMP280::SAMPLING_X16,',
      '                  Adafruit_BMP280::FILTER_X16,',
      '                  Adafruit_BMP280::STANDBY_MS_1);',
      '}'
    ],
    loop: [
      '// Read barometric altitude for altitude-hold PID',
      'float baroAltM = baro.readAltitude(1013.25);'
    ]
  },
  {
    match: /NEO-M9N|GPS/i,
    name: 'u-blox NEO-M9N GNSS / GPS',
    headers: ['#include <TinyGPSPlus.h>', '#include <HardwareSerial.h>'],
    decl: 'TinyGPSPlus gps;\nHardwareSerial GPSSerial(1);',
    setup: [
      '// --- Initialize u-blox GNSS GPS (9600 / 115200 Baud) ---',
      'GPSSerial.begin(9600, SERIAL_8N1, {{PIN:TX}}, {{PIN:RX}});',
      'Serial.println(F("[OK] GPS Serial port listening."));'
    ],
    loop: [
      '// Process NMEA sentences from GNSS',
      'while (GPSSerial.available() > 0) {',
      '  gps.encode(GPSSerial.read());',
      '}',
      'if (gps.location.isUpdated()) {',
      '  double droneLat = gps.location.lat();',
      '  double droneLng = gps.location.lng();',
      '}'
    ]
  },
  {
    match: /VL53L1X|TOF/i,
    name: 'VL53L1X Laser ToF Rangefinder',
    headers: ['#include <Wire.h>', '#include <VL53L1X.h>'],
    decl: 'VL53L1X tofSensor;',
    setup: [
      '// --- Initialize VL53L1X Time-of-Flight Sensor ---',
      'tofSensor.setTimeout(500);',
      'if (!tofSensor.init()) {',
      '  Serial.println(F("[ERROR] Failed to detect VL53L1X ToF sensor!"));',
      '} else {',
      '  tofSensor.setDistanceMode(VL53L1X::Medium);',
      '  tofSensor.setMeasurementTimingBudget(33000);',
      '  tofSensor.startContinuous(33);',
      '  Serial.println(F("[OK] VL53L1X ToF laser ranging started."));',
      '}'
    ],
    loop: [
      '// Read ground surface distance (mm)',
      'uint16_t groundDistMm = tofSensor.read();'
    ]
  },
  {
    match: /SSD1306|OLED/i,
    name: 'SSD1306 Telemetry OLED Display',
    headers: ['#include <Wire.h>', '#include <Adafruit_GFX.h>', '#include <Adafruit_SSD1306.h>'],
    decl: '#define SCREEN_WIDTH 128\n#define SCREEN_HEIGHT 64\nAdafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);',
    setup: [
      '// --- Initialize SSD1306 Telemetry Display ---',
      'if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {',
      '  Serial.println(F("[ERROR] SSD1306 allocation failed"));',
      '} else {',
      '  display.clearDisplay();',
      '  display.setTextSize(1);',
      '  display.setTextColor(SSD1306_WHITE);',
      '  display.setCursor(0,0);',
      '  display.println(F("AeroForge Flight Core"));',
      '  display.display();',
      '}'
    ],
    loop: [
      '// Telemetry HUD update',
      'display.clearDisplay();',
      'display.setCursor(0, 0);',
      'display.print(F("ALT: ")); display.print(baroAltM); display.println(F(" m"));',
      'display.display();'
    ]
  },
  {
    match: /Buzzer/i,
    name: 'Active Drone Buzzer Alarm',
    headers: [],
    decl: '// Active Drone Lost-Model Alarm',
    setup: [
      'pinMode({{PIN:-}}, OUTPUT);',
      'digitalWrite({{PIN:-}}, LOW);'
    ],
    loop: [
      '// Lost-model beacon logic (uncomment to beep)',
      '// digitalWrite({{PIN:-}}, HIGH); delay(50); digitalWrite({{PIN:-}}, LOW);'
    ]
  },
  {
    match: /BLHeli|ESC|Motor/i,
    name: 'Brushless / Coreless Drone Motor Propulsion',
    headers: ['#include <ESP32Servo.h>'],
    decl: '// Motor PWM Outputs for Quadcopter X-Configuration\nServo motor_m1, motor_m2, motor_m3, motor_m4;',
    setup: [
      '// Arm ESCs with 1000us minimum throttle command',
      '#if defined(PIN_M1)',
      'motor_m1.attach(PIN_M1, 1000, 2000); motor_m1.writeMicroseconds(1000);',
      '#endif',
      '#if defined(PIN_M2)',
      'motor_m2.attach(PIN_M2, 1000, 2000); motor_m2.writeMicroseconds(1000);',
      '#endif',
      '#if defined(PIN_M3)',
      'motor_m3.attach(PIN_M3, 1000, 2000); motor_m3.writeMicroseconds(1000);',
      '#endif',
      '#if defined(PIN_M4)',
      'motor_m4.attach(PIN_M4, 1000, 2000); motor_m4.writeMicroseconds(1000);',
      '#endif',
      'Serial.println(F("[OK] ESCs armed at 1000us."));'
    ],
    loop: [
      '// Motor Mixing Algorithm (Quadcopter X)',
      '// int16_t m1_cmd = throttle - pitch_cmd + roll_cmd - yaw_cmd;',
      '// int16_t m2_cmd = throttle + pitch_cmd + roll_cmd + yaw_cmd;',
      '// int16_t m3_cmd = throttle + pitch_cmd - roll_cmd - yaw_cmd;',
      '// int16_t m4_cmd = throttle - pitch_cmd - roll_cmd + yaw_cmd;'
    ]
  }
];

function findDriverTemplate(variant) {
  return DRIVER_TEMPLATES.find(t => t.match.test(variant)) || null;
}

function generateFirmwareCode() {
  switchTab('codeOutput');

  const mcu = canvas.getObjects().find(o => o.isComponent && o.compCategory === 'Microcontrollers');
  if (!mcu) {
    log('❌ Cannot generate code: Add a flight controller to the canvas first.', 'error');
    document.getElementById('codeOutput').textContent = '// Add a microcontroller or flight controller to the canvas first.';
    return;
  }

  /* Analyze wiring */
  const peripherals = new Map();
  let sdaPin = null, sclPin = null;

  wires.forEach(w => {
    const oa = objectsByUid.get(w.a.uid);
    const ob = objectsByUid.get(w.b.uid);
    if (!oa || !ob) return;

    let periph = null, periphPinIdx = -1, mcuPinIdx = -1;
    if (oa === mcu && ob !== mcu) {
      periph = ob; mcuPinIdx = w.a.pin; periphPinIdx = w.b.pin;
    } else if (ob === mcu && oa !== mcu) {
      periph = oa; mcuPinIdx = w.b.pin; periphPinIdx = w.a.pin;
    } else return;

    const mcuSignal = mcu.pinDefs[mcuPinIdx].signal;
    if (mcuSignal === 'i2c_sda') sdaPin = mcu.pinDefs[mcuPinIdx];
    if (mcuSignal === 'i2c_scl') sclPin = mcu.pinDefs[mcuPinIdx];

    if (!peripherals.has(periph)) peripherals.set(periph, []);
    peripherals.get(periph).push({ periphPinIdx, mcuPinIdx });
  });

  const includes = new Set(['#include <Arduino.h>', '#include <Wire.h>', '#include <SPI.h>']);
  const defines  = [];
  const decls    = [];
  const setlines = [];
  const looplines= [];
  const handledDrivers = new Set();

  /* Generate GPIO Defines */
  peripherals.forEach((conns, periph) => {
    const prefix = safeIdent(periph.compVariant);
    const pinMap = {};

    conns.forEach(c => {
      const periphPin = periph.pinDefs[c.periphPinIdx];
      const mcuPin    = mcu.pinDefs[c.mcuPinIdx];
      const defName   = `PIN_${prefix}_${safeIdent(periphPin.name)}`;
      pinMap[periphPin.name] = defName;

      if (mcuPin.gpio >= 0) {
        defines.push(`#define ${defName.padEnd(28)} ${mcuPin.gpio} // ${mcuPin.name} (${periphPin.desc})`);
      } else {
        defines.push(`// ${defName} → ${mcuPin.name} (Power Rail)`);
      }
    });

    const driver = findDriverTemplate(periph.compVariant);
    if (driver && !handledDrivers.has(driver.name)) {
      handledDrivers.add(driver.name);
      driver.headers.forEach(h => includes.add(h));
      if (driver.decl) decls.push(driver.decl);
      driver.setup.forEach(s => {
        let line = s;
        Object.keys(pinMap).forEach(k => {
          line = line.replace(new RegExp(`\\{\\{PIN:${k}\\}\\}`, 'g'), pinMap[k]);
        });
        setlines.push(line);
      });
      driver.loop.forEach(l => {
        let line = l;
        Object.keys(pinMap).forEach(k => {
          line = line.replace(new RegExp(`\\{\\{PIN:${k}\\}\\}`, 'g'), pinMap[k]);
        });
        looplines.push(line);
      });
    }
  });

  /* Motor Pad Direct Defines if Flight Controller has M1-M4 */
  ['M1', 'M2', 'M3', 'M4'].forEach(mPinName => {
    const p = mcu.pinDefs.find(pin => pin.name === mPinName);
    if (p && p.gpio >= 0) {
      defines.push(`#define PIN_${mPinName.padEnd(24)} ${p.gpio} // Flight Controller PWM Output`);
    }
  });

  const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const out = [];
  out.push('/* =========================================================================');
  out.push(' *  AeroForge — Virtual Drone Lab Firmware Generator');
  out.push(' *  Target FC  : ' + mcu.compVariant);
  out.push(' *  Generated  : ' + timeStr);
  out.push(' *  Modules    : ' + peripherals.size + ' wired module(s)');
  out.push(' *  Total Nets : ' + wires.length + ' electrical wire(s)');
  out.push(' * ========================================================================= */');
  out.push('');
  out.push([...includes].join('\n'));
  out.push('');
  out.push('/* -------------------------------------------------------------------------');
  out.push(' *  PIN ASSIGNMENTS (Dynamically mapped from canvas wiring)');
  out.push(' * ------------------------------------------------------------------------- */');
  out.push(defines.length ? defines.join('\n') : '// No GPIO signals routed');
  out.push('');
  out.push('/* -------------------------------------------------------------------------');
  out.push(' *  GLOBAL HARDWARE DRIVER INSTANCES');
  out.push(' * ------------------------------------------------------------------------- */');
  out.push(decls.length ? decls.join('\n\n') : '// No high-level sensors instantiated');
  out.push('');
  out.push('/* -------------------------------------------------------------------------');
  out.push(' *  SETUP ROUTINE');
  out.push(' * ------------------------------------------------------------------------- */');
  out.push('void setup() {');
  out.push('  Serial.begin(115200);');
  out.push('  delay(250);');
  out.push('  Serial.println(F("========================================"));');
  out.push(`  Serial.println(F("[AeroForge] Booting ${mcu.compVariant}..."));`);
  out.push('  Serial.println(F("========================================"));');
  out.push('');

  /* I2C Bus setup */
  if (sdaPin && sclPin) {
    out.push(`  // Initialize I2C Bus on GPIO ${sdaPin.gpio} (SDA) and GPIO ${sclPin.gpio} (SCL)`);
    if (mcu.compVariant.includes('ESP32')) {
      out.push(`  Wire.begin(${sdaPin.gpio}, ${sclPin.gpio});`);
    } else if (mcu.compVariant.includes('RP2040')) {
      out.push(`  Wire.setSDA(${sdaPin.gpio}); Wire.setSCL(${sclPin.gpio}); Wire.begin();`);
    } else {
      out.push('  Wire.begin();');
    }
  } else {
    out.push('  Wire.begin();');
  }
  out.push('  Wire.setClock(400000); // 400kHz Fast Mode for Drone IMUs');
  out.push('');

  if (setlines.length) {
    setlines.forEach(l => out.push('  ' + l));
    out.push('');
  }
  out.push('  Serial.println(F("[AeroForge] Calibration complete. Ready for arming."));');
  out.push('}');
  out.push('');
  out.push('/* -------------------------------------------------------------------------');
  out.push(' *  MAIN REAL-TIME FLIGHT LOOP');
  out.push(' * ------------------------------------------------------------------------- */');
  out.push('void loop() {');
  if (looplines.length) {
    looplines.forEach(l => out.push('  ' + l));
  } else {
    out.push('  // All systems idle. Add sensors or motors to populate loop.');
  }
  out.push('');
  out.push('  delay(2); // 500Hz Flight Controller Loop Rate');
  out.push('}');
  out.push('');

  const finalCode = out.join('\n');
  document.getElementById('codeOutput').textContent = finalCode;
  log(`⚡ Arduino C++ Firmware generated (${peripherals.size} devices mapped).`, 'ok');
}

document.getElementById('generateBtn').addEventListener('click', () => {
  validateCircuit();
  generateFirmwareCode();
});

/* Copy Code */
document.getElementById('copyCodeBtn').addEventListener('click', () => {
  const code = document.getElementById('codeOutput').textContent;
  if (!code || code.startsWith('// Add a')) {
    log('Press "Generate Code" before copying.', 'warn');
    return;
  }
  navigator.clipboard.writeText(code).then(() => {
    log('📋 Arduino C++ code copied to clipboard.', 'ok');
  }).catch(() => {
    log('Clipboard write failed.', 'error');
  });
});

/* Download .ino file */
document.getElementById('downloadBtn').addEventListener('click', () => {
  const code = document.getElementById('codeOutput').textContent;
  if (!code || code.startsWith('// Add a')) {
    log('Press "Generate Code" before downloading.', 'warn');
    return;
  }
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'AeroForge_Drone_Firmware.ino';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  log('⬇️ Downloaded AeroForge_Drone_Firmware.ino', 'ok');
});

/* ═════════════════════════════════════════════════════════════════
   17. NETLIST & WIRING MAP
   ═════════════════════════════════════════════════════════════════ */
const wireCountBadge = document.getElementById('wireCountBadge');

function renderWiringMap() {
  const el = document.getElementById('wiringOutput');
  wireCountBadge.textContent = String(wires.length);

  if (wires.length === 0) {
    el.textContent = '// No wires routed yet.\n// Enable Wire Mode and connect golden pins between components.';
    return;
  }

  const rows = wires.map((w, i) => {
    const oa = objectsByUid.get(w.a.uid);
    const ob = objectsByUid.get(w.b.uid);
    if (!oa || !ob) return null;
    const pa = oa.pinDefs[w.a.pin];
    const pb = ob.pinDefs[w.b.pin];
    const verdict = signalCompat(pa.signal, pb.signal);

    const flag = verdict.status === 'error' ? '❌ ERROR' :
                 verdict.status === 'warn'  ? '⚠️ WARN ' : '✅ OK   ';

    return {
      num: String(i + 1).padStart(2, '0'),
      from: `${oa.compVariant} [${pa.name}]`,
      to: `${ob.compVariant} [${pb.name}]`,
      signals: `${pa.signal} ↔ ${pb.signal}`,
      status: flag,
      reason: verdict.reason
    };
  }).filter(Boolean);

  const wFrom = Math.max(12, ...rows.map(r => r.from.length));
  const wTo   = Math.max(12, ...rows.map(r => r.to.length));
  const wSig  = Math.max(14, ...rows.map(r => r.signals.length));

  const header =
    'NET#  ' +
    'FROM (PORT A)'.padEnd(wFrom) + '  ' +
    'TO (PORT B)'.padEnd(wTo)     + '  ' +
    'SIGNAL NET'.padEnd(wSig)     + '  STATUS    CHECK';
  const sep = '═'.repeat(header.length + 8);

  const body = rows.map(r =>
    `${r.num}    ${r.from.padEnd(wFrom)}  ${r.to.padEnd(wTo)}  ${r.signals.padEnd(wSig)}  ${r.status}  ${r.reason}`
  ).join('\n');

  el.textContent = header + '\n' + sep + '\n' + body + '\n\n' + `Total Net Connections: ${rows.length}`;
}

/* ═════════════════════════════════════════════════════════════════
   18. PROJECT PERSISTENCE (JSON Save / Load)
   ═════════════════════════════════════════════════════════════════ */
const AUTOSAVE_KEY = 'aeroforge_project_v2';
let autosaveTimer = null;

function serializeProject() {
  const comps = canvas.getObjects().filter(o => o.isComponent).map(o => ({
    uid: o.uid,
    cat: o.compCategory,
    variant: o.compVariant,
    x: o.left,
    y: o.top,
    scaleX: o.scaleX,
    scaleY: o.scaleY,
    angle: o.angle
  }));

  const wireList = wires.map(w => {
    const oa = objectsByUid.get(w.a.uid), ob = objectsByUid.get(w.b.uid);
    if (!oa || !ob) return null;
    return {
      aUid: w.a.uid, aPin: oa.pinDefs[w.a.pin].name,
      bUid: w.b.uid, bPin: ob.pinDefs[w.b.pin].name
    };
  }).filter(Boolean);

  return {
    app: 'AeroForge',
    version: 2,
    savedAt: new Date().toISOString(),
    components: comps,
    wires: wireList
  };
}

function autosave() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(serializeProject()));
    } catch (e) { /* local storage full or private browsing */ }
  }, 600);
}

function loadProject(data) {
  if (!data || !Array.isArray(data.components)) {
    log('Invalid AeroForge project file format.', 'error');
    return false;
  }

  canvas.clear();
  canvas.backgroundColor = null;
  objectsByUid.clear();
  wires.length = 0;
  selectedWire = null;
  anchor = null;
  removeAnchorMarker();

  const uidMap = new Map();

  data.components.forEach(c => {
    if (!DB[c.cat]) return;
    const group = addComponent(c.cat, c.variant, { x: c.x, y: c.y });
    if (!group) return;
    if (typeof c.angle === 'number') group.rotate(c.angle);
    if (typeof c.scaleX === 'number') group.set({ scaleX: c.scaleX, scaleY: c.scaleY });
    group.setCoords();
    uidMap.set(c.uid, group);
  });

  (data.wires || []).forEach(w => {
    const a = uidMap.get(w.aUid), b = uidMap.get(w.bUid);
    if (!a || !b) return;
    const ia = a.pinDefs.findIndex(p => p.name.toLowerCase() === w.aPin.toLowerCase());
    const ib = b.pinDefs.findIndex(p => p.name.toLowerCase() === w.bPin.toLowerCase());
    if (ia >= 0 && ib >= 0) {
      createWire({ obj: a, pin: ia, pos: pinScenePos(a, ia) },
                 { obj: b, pin: ib, pos: pinScenePos(b, ib) });
    }
  });

  canvas.discardActiveObject();
  canvas.requestRenderAll();
  clearProperties();
  refreshWires();
  renderWiringMap();
  syncEngineeringGrid();
  return true;
}

document.getElementById('exportBtn').addEventListener('click', () => {
  const json = JSON.stringify(serializeProject(), null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'AeroForge_Drone_Project.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  log('💾 Exported circuit to AeroForge_Drone_Project.json', 'ok');
});

const importFileEl = document.getElementById('importFile');
document.getElementById('importBtn').addEventListener('click', () => importFileEl.click());
importFileEl.addEventListener('change', () => {
  const file = importFileEl.files && importFileEl.files[0];
  importFileEl.value = '';
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (loadProject(data)) {
        log(`📂 Project loaded from ${file.name}`, 'ok');
        autosave();
      }
    } catch (e) {
      log('Could not parse JSON project file.', 'error');
    }
  };
  reader.readAsText(file);
});

/* ═════════════════════════════════════════════════════════════════
   19. DEFAULT DRONE BENCHMARK DEMO
   ═════════════════════════════════════════════════════════════════ */
function connectPins(objA, nameA, objB, nameB) {
  const ia = objA.pinDefs.findIndex(p => p.name.toLowerCase() === nameA.toLowerCase());
  const ib = objB.pinDefs.findIndex(p => p.name.toLowerCase() === nameB.toLowerCase());
  if (ia < 0 || ib < 0) return;
  createWire({ obj: objA, pin: ia, pos: pinScenePos(objA, ia) },
             { obj: objB, pin: ib, pos: pinScenePos(objB, ib) });
}

function loadDefaultDroneDemo() {
  const W = canvas.getWidth();
  const H = canvas.getHeight();

  /* 1. Primary Flight Controller (STM32F405) */
  const fc = addComponent('Microcontrollers', 'STM32F405 Flight Controller',
                          { x: W * 0.40, y: H * 0.48 });

  /* 2. 6-DOF IMU Sensor (MPU-6050) */
  const imu = addComponent('Sensors & Navigation', 'MPU-6050 (6-DOF IMU)',
                           { x: W * 0.74, y: H * 0.28 });

  /* 3. Barometer (BMP280) */
  const baro = addComponent('Sensors & Navigation', 'BMP280 (Barometer)',
                            { x: W * 0.74, y: H * 0.68 });

  /* 4. GPS / GNSS Receiver (u-blox NEO-M9N) */
  const gps = addComponent('Sensors & Navigation', 'u-blox NEO-M9N (GNSS/GPS)',
                           { x: W * 0.16, y: H * 0.76 });

  /* 5. 3S 11.1V 1500mAh LiPo Battery */
  const lipo = addComponent('Power & Actuators', '3S LiPo Battery (11.1V 1500mAh 75C)',
                            { x: W * 0.15, y: H * 0.28 });

  if (!fc || !imu || !baro || !gps || !lipo) return;

  /* I2C Sensor Bus Wiring (MPU-6050) */
  connectPins(imu, 'VCC', fc, '3V3');
  connectPins(imu, 'GND', fc, 'GND');
  connectPins(imu, 'SDA', fc, 'SDA');
  connectPins(imu, 'SCL', fc, 'SCL');

  /* I2C Sensor Bus Wiring (BMP280) */
  connectPins(baro, 'VCC', fc, '3V3');
  connectPins(baro, 'GND', fc, 'GND');
  connectPins(baro, 'SDA', fc, 'SDA');
  connectPins(baro, 'SCL', fc, 'SCL');

  /* UART1 GPS Wiring (Cross-coupled TX->RX, RX->TX) */
  connectPins(gps, 'VCC', fc, '5V');
  connectPins(gps, 'GND', fc, 'GND');
  connectPins(gps, 'TX',  fc, 'RX1');
  connectPins(gps, 'RX',  fc, 'TX1');

  /* Battery VBat to ADC Voltage Monitor */
  connectPins(lipo, 'V+', fc, 'VBAT');
  connectPins(lipo, 'V-', fc, 'GND');

  canvas.discardActiveObject();
  canvas.requestRenderAll();
}

/* ═════════════════════════════════════════════════════════════════
   20. INITIALIZATION
   ═════════════════════════════════════════════════════════════════ */
function boot() {
  resizeCanvas();
  renderLibrary();

  log('🛸 AeroForge Virtual Drone Lab v2.0 Initialized.', 'accent');

  let restored = false;
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.components) && data.components.length) {
        restored = loadProject(data);
        if (restored) log('Restored previous drone workbench session from browser storage.', 'accent');
      }
    }
  } catch (e) { /* ignore */ }

  if (!restored) {
    log('Deploying benchmark STM32F405 Quadcopter flight control circuit…', 'dim');
    loadDefaultDroneDemo();
    autosave();
  }

  renderWiringMap();
  switchTab('consoleOutput');
  syncEngineeringGrid();

  log('', 'info');
  log('⚡ Quick Tips:', 'accent');
  log('  • Click "Wire Mode: OFF" to turn ON interactive pin-to-pin wiring.', 'info');
  log('  • Hover over any golden pin pad to view real-time pinout & signal tooltips.', 'info');
  log('  • Press "Validate" to execute the Electrical & Bus Compatibility engine.', 'info');
  log('  • Press "Generate Code" to produce ready-to-flash Arduino C++ (.ino) flight code.', 'info');
  log('  • Right-click or press D to duplicate; press R to rotate 90°.', 'info');

  setTimeout(resizeCanvas, 120);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  boot();
} else {
  window.addEventListener('DOMContentLoaded', boot);
}

})();
