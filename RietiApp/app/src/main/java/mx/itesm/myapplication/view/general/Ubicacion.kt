package mx.itesm.myapplication.view.general

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import mx.itesm.myapplication.view.seguimiento.MapaInteractivo

@Composable
fun Ubicacion(
    navController: NavController,
    modifier: Modifier = Modifier
){
    var municipio by remember { mutableStateOf("") }
    var colonia by remember { mutableStateOf("") }
    var calle by remember { mutableStateOf("") }

    Column(
        modifier = modifier
    ) {
        Text(
            text = "¿Dónde viste la situación?"
        )
        Spacer(modifier = Modifier.height(10.dp))

        MapaInteractivo()

        Spacer(modifier = Modifier.height(15.dp))
        Text("O escribe la ubicación",
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Center)

        Spacer(modifier = Modifier.height(15.dp))

        OutlinedTextField(
            value = municipio,
            onValueChange = {municipio = it},
            label = {Text("Municipio")},
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = colonia,
            onValueChange = {colonia = it},
            label = {Text("Colonia")},
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = calle,
            onValueChange = {calle = it},
            label = {Text("Calle")},
            modifier = Modifier.fillMaxWidth()
        )
    }
}