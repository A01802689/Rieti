package mx.itesm.myapplication.view.anonimo

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import mx.itesm.myapplication.view.general.Ubicacion

/**
 * Pantalla del paso de ubicación dentro del flujo de reporte anónimo.
 *
 * Muestra una fila superior con un botón para regresar, el título "Reporte Anónimo", el
 * componente [Ubicacion] (mapa y campos de texto para indicar dónde se observó la situación)
 * y, al final, un botón "Continuar" que avanza al siguiente paso del flujo.
 *
 * @param navController Controlador de navegación usado para regresar a la pantalla anterior
 */
@Composable
fun AnonimoUbicacion(navController: NavController) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(20.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ){
            // Fila de encabezado con el botón para regresar.
            IconButton(onClick = {
                navController.popBackStack()
            })
            {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Volver"
                )
            }
            Text(text = "Volver")
        }
        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = "Reporte Anónimo",
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(25.dp))
        Ubicacion(navController = navController,
            modifier = Modifier.weight(1f))

        Button(
            onClick = {
                navController.navigate(route = "AnFormulario")
            },
            modifier = Modifier.fillMaxWidth()
        ) { Text("Continuar") }
    }
}

@Preview(showBackground = true)
@Composable
fun PrevAnonimoUbicacion() {
    AnonimoUbicacion(navController = rememberNavController())
}