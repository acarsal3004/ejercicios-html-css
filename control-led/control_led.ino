/*
  PROYECTO: CONTROL INDEPENDIENTE Y PWM TOTAL - Abrahm y Roland
  - LED Azul: Pin digital 9 (PWM)
  - LED Naranja: Pin digital 10 (PWM)
  - LED Verde: Pin digital 11 (PWM)
*/

const int ledAzul = 9;
const int ledNaranja = 10;
const int ledVerde = 11;

String mensaje = "";
bool parpadeando = false;

void setup() {
  pinMode(ledAzul, OUTPUT);
  pinMode(ledNaranja, OUTPUT);
  pinMode(ledVerde, OUTPUT);

  digitalWrite(ledAzul, LOW);
  digitalWrite(ledNaranja, LOW);
  digitalWrite(ledVerde, LOW);

  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {
    mensaje = Serial.readStringUntil('\n');
    mensaje.trim();

    // Controles generales
    if (mensaje == "ON_ALL") {
      digitalWrite(ledAzul, HIGH);
      digitalWrite(ledNaranja, HIGH);
      digitalWrite(ledVerde, HIGH);
      Serial.println("ESTADO_ON");
    }
    else if (mensaje == "OFF_ALL" || mensaje == "STOP_BLINK") {
      digitalWrite(ledAzul, LOW);
      digitalWrite(ledNaranja, LOW);
      digitalWrite(ledVerde, LOW);
      Serial.println("ESTADO_OFF");
    }
    else if (mensaje == "BLINK") {
      // Parpadeo rápido de todos los LEDs
      for (int i = 0; i < 4; i++) {
        digitalWrite(ledAzul, HIGH);
        digitalWrite(ledNaranja, HIGH);
        digitalWrite(ledVerde, HIGH);
        delay(300);
        digitalWrite(ledAzul, LOW);
        digitalWrite(ledNaranja, LOW);
        digitalWrite(ledVerde, LOW);
        delay(300);
      }
      Serial.println("ESTADO_ON");
    }
    
    // Control individual: LED Azul (Pin 9)
    else if (mensaje == "AZUL_ON") {
      digitalWrite(ledAzul, HIGH);
      Serial.println("ESTADO_ON");
    }
    else if (mensaje == "AZUL_OFF") {
      digitalWrite(ledAzul, LOW);
    }

    // Control individual: LED Naranja (Pin 10)
    else if (mensaje == "NARANJA_ON") {
      digitalWrite(ledNaranja, HIGH);
      Serial.println("ESTADO_ON");
    }
    else if (mensaje == "NARANJA_OFF") {
      digitalWrite(ledNaranja, LOW);
    }

    // Control individual: LED Verde (Pin 11)
    else if (mensaje == "VERDE_ON") {
      digitalWrite(ledVerde, HIGH);
      Serial.println("ESTADO_ON");
    }
    else if (mensaje == "VERDE_OFF") {
      digitalWrite(ledVerde, LOW);
    }

    // Luminosidad PWM para TODOS los LEDs a la vez
    else if (mensaje.startsWith("PWM_")) {
      int valorPwm = mensaje.substring(4).toInt();
      analogWrite(ledAzul, valorPwm);
      analogWrite(ledNaranja, valorPwm);
      analogWrite(ledVerde, valorPwm);
      if (valorPwm > 0) {
        Serial.println("ESTADO_ON");
      } else {
        Serial.println("ESTADO_OFF");
      }
    }
  }
}
