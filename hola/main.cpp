#include <iostream>

int jugador = 100;
int enemigo = 50;

bool turno = false;

do
{
    Serial.println("1 Atacar");
    Serial.println("2 Salir");

    if (turno)
    {
        enemigo =- 10;
        jugador =- 5;
    }
    
} while (turno);
