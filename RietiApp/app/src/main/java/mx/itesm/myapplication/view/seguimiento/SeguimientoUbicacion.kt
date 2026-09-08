package mx.itesm.myapplication.view.seguimiento

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController

@Composable
fun SeguimientoUbicacion(navController: NavController) {

    var municipio by remember { mutableStateOf("") }
    var colonia by remember { mutableStateOf("") }
    var calle by remember { mutableStateOf("") }


    Column(
        modifier = Modifier.fillMaxSize().padding(20.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
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
            text = "Reporte con Seguimiento",
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Recibiras tu folio por correo o WhatsApp"
        )
        Spacer(modifier = Modifier.height(15.dp))

        Box(
            modifier = Modifier.fillMaxWidth().height(220.dp).background(Color.LightGray),
            contentAlignment = Alignment.Center
        ) {Text("Mapa de ubicacion actual*") }
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
        Spacer(modifier = Modifier.weight(1f))

        Button(
            onClick = {
                //Conectar con la siguiente pantalla
            }, modifier = Modifier.fillMaxWidth()
        ) {Text("Continuar") }
    }
}

@Preview(showBackground = true)
@Composable
fun PrevUbicacion(){
    SeguimientoUbicacion(navController = rememberNavController())
}