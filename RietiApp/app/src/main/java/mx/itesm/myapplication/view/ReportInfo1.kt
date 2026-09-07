package mx.itesm.myapplication.view

import android.widget.Space
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import androidx.navigation.NavHostController
import androidx.navigation.compose.rememberNavController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun reportePantallaB(navController: NavHostController){
    var contadorMenores by remember { mutableStateOf(" ") }
    var menuDownState by remember { mutableStateOf(false) }
    var selectedActivity by remember { mutableStateOf("Seleccione una actividad a reportar") }
    val actividad = listOf("Venta de insumos, Venta de estupefacientes, venta de periodicos, limpiaparabrizas")
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Button(
            onClick = { navController.navigate("main-view")},
            modifier = Modifier.height(40.dp)
        ) { Text(text = "<-Regresar", fontSize = 25.sp)}
        Spacer(modifier = Modifier.height(15.dp))
        Text(text = "Parte 2 del reporte", fontSize = 12.sp)
        Spacer(modifier = Modifier.height(20.dp))
        Text(text = "¿Cuantos menores se observaron?", fontSize = 20.sp)
        Spacer(modifier = Modifier.height(8.dp))
        Text(text = "Escribe la cantidad:")
        Spacer(modifier = Modifier.height(8.dp).padding(16.dp))
        TextField(
            value = contadorMenores,
            onValueChange = {contadorMenores = it},
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(text = "Selecciona la actividad que se observo:", fontSize = 20.sp)
        Spacer(modifier = Modifier.height(8.dp))
        ExposedDropdownMenuBox(
            expanded = menuDownState,
            onExpandedChange = {menuDownState =! menuDownState}) {
            TextField(
                value = selectedActivity,
                onValueChange = {},
                readOnly = true,
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = menuDownState) },
                modifier = Modifier.menuAnchor().fillMaxWidth()
            )
            ExposedDropdownMenu(
                expanded = menuDownState,
                onDismissRequest = {menuDownState = false}) {
                actividad.forEach { actividad ->
                    DropdownMenuItem(
                        text = {Text(text = actividad)},
                        onClick = {
                            selectedActivity = actividad
                            menuDownState = false
                        }
                    )
                }
            }
        }
        Spacer(modifier = Modifier.weight(1f))
        Button(
            onClick = { navController.navigate("report-route-2")},
            modifier = Modifier.fillMaxWidth().height(70.dp)
        ) { Text(text = "Continuar", fontSize = 25.sp)}

    }
}

@Composable
fun ReportePantallaC(navController: NavHostController){
    var description by remember { mutableStateOf("") }
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Button(
            onClick = { navController.navigate("main-view")},
            modifier = Modifier.height(40.dp)
        ) { Text(text = "<-Regresar", fontSize = 25.sp)}
        Spacer(modifier = Modifier.height(15.dp))
        Text(text = "Describe las acciones que presenciaste", fontSize = 20.sp)
        Text(text = "Se lo mas claro posible, esto sera analizado por una autoridad ", fontSize = 15.sp)
        Spacer(modifier = Modifier.height(8.dp))
        TextField(
            value = description,
            onValueChange = { description = it },
            modifier = Modifier.fillMaxWidth().height(150.dp),
            maxLines = 6
        )
        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = { /* TODO: Implement CameraX or ActivityResultLauncher to capture an image */ },
            modifier = Modifier.fillMaxWidth().height(70.dp)
        ) { Text("Tomar fotografía del lugar", fontSize = 20.sp)}
        Spacer(modifier = Modifier.weight(1f))
        Button(
            onClick = { navController.navigate("main-view")},
            modifier = Modifier.fillMaxWidth().height(70.dp)
        ) { Text(text = "Enviar Reporte", fontSize = 25.sp)}


    }
}

@Preview(showBackground = true, name = "Paso 1 del Reporte")
@Composable
fun ReportStepOnePreview() {
    ReportePantallaC(navController = rememberNavController())
}