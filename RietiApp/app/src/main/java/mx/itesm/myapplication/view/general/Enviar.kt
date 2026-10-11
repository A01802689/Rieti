package mx.itesm.myapplication.view.general

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

/**
 * Pantalla para redactar y enviar un reporte.
 *
 * Muestra un formulario con tres elementos principales:
 * - Un campo de texto multilínea para describir la situación a reportar.
 * - Un botón para adjuntar una fotografía (pendiente de implementar: abrirá la galería).
 * - Un botón para enviar el reporte (pendiente de implementar: enviará los datos).
 *
 * @param navController Controlador de navegación usado para moverse entre pantallas.
 * @param modifier [Modifier] aplicado al contenedor raíz ([Column]) de la pantalla.
 */
@Composable
fun Enviar(
    navController: NavController,
    modifier: Modifier = Modifier
) {
    /** Texto que el usuario escribe para describir la situación del reporte. */
    var descripcion by remember { mutableStateOf("") }

    Column(
        modifier = modifier
    ) {
        OutlinedTextField(
            value = descripcion,
            onValueChange = {
                descripcion = it
            },
            label = {
                Text("Describe la situación")
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(180.dp)
        )

        Spacer(modifier = Modifier.height(20.dp))

        OutlinedButton(
            onClick = {
                // luego abrir galería
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Adjuntar fotografía")
        }

        Spacer(modifier = Modifier.weight(1f))

        Button(
            onClick = {

                // luego enviar reporte

            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Enviar reporte")
        }
    }


}