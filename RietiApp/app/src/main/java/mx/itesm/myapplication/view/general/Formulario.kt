package mx.itesm.myapplication.view.general

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

@Composable
fun Formulario(
    navController: NavController,
    modifier: Modifier = Modifier
) {
    var cantidadSeleccionada by remember { mutableStateOf("") }
    var edadSeleccionada by remember { mutableStateOf("") }
    var actividadSeleccionada by remember { mutableStateOf("") }
    var riesgoSeleccionado by remember { mutableStateOf("") }

    Column(
        modifier = modifier
    ) {
        Text(
            text = "¿Cuantas niñas, niños o adolescentes observaste?"
        )

        val opcionesCantidad = listOf("1", "2", "3", "5 o más", "No sé")
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(5.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            opcionesCantidad.forEach { opcion ->
                FilterChip(
                    selected = cantidadSeleccionada == opcion,
                    onClick = { cantidadSeleccionada = opcion },
                    label = { Text(opcion) }
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = "Edad aproximada"
        )
        val edades = listOf("0-5", "6-11", "12-14", "15-17", "No sé")
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(5.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            edades.forEach { edad ->
                FilterChip(
                    selected = edadSeleccionada == edad,
                    onClick = { edadSeleccionada = edad },
                    label = { Text(edad) }
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = "¿Que estaban haciendo?"
        )
        val actividades = listOf(
            "Venta ambulante", "Limpieza de parabrisas", "Mendicidad",
            "Carga y descarga", "Construccion", "Trabajo doméstico", "No sé"
        )
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(5.dp),
            verticalArrangement = Arrangement.spacedBy(1.dp)
        ) {
            actividades.forEach { actividad ->
                FilterChip(
                    selected = actividadSeleccionada == actividad,
                    onClick = { actividadSeleccionada = actividad },
                    label = { Text(actividad) }
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = "¿Observaste alguna situación de riesgo?"
        )
        val riesgos = listOf("Sí", "No", "No sé")
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(5.dp),
            verticalArrangement = Arrangement.spacedBy(1.dp)
        ) {
            riesgos.forEach { riesgo ->
                FilterChip(
                    selected = riesgoSeleccionado == riesgo,
                    onClick = { riesgoSeleccionado = riesgo },
                    label = { Text(riesgo) }
                )
            }
        }

        Spacer(modifier = Modifier.weight(1f))
        Button(
            onClick = {
                navController.navigate(route = "SegUbicacion")
            },
            modifier = Modifier.fillMaxWidth()
        ) { Text("Continuar") }
    }
}