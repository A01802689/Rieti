package mx.itesm.myapplication.view.MainVIew

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PersonOff
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import mx.itesm.myapplication.view.Pantalla

/**
 * Vista principal para elegir el tipo de reporte que se quiere enviar.
 *
 * @param navController Controlador de navegación que se pasa a [ReportsOptions] para que cada
 *  opción pueda navegar a su flujo.
 *
 *
 */

@Composable
fun GenerateReportMainView(navController: NavController, modifier: Modifier = Modifier) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(
            "¿Qué tipo de reporte quieres enviar?",
            color = MaterialTheme.colorScheme.onBackground,
            modifier = modifier
        )
        ReportsOptions(navController)
    }
}

/**
 * Fila con las dos opciones de reporte, una junto a la otra y con el mismo ancho.
 *
 * Muestra dos [ReportCard]: la primera para el reporte anónimo (`anonymous = true`) y la
 * segunda para el reporte con seguimiento (`anonymous = false`). Cada tarjeta ocupa la mitad
 * del ancho disponible gracias a `weight(1f)`, y las dos se separan por 4 dp.
 */

@Composable
fun ReportsOptions(navController: NavController, modifier: Modifier = Modifier) {
    Box(modifier = Modifier, contentAlignment = Alignment.Center){
        Row(
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            ReportCard(true, navController, modifier.weight(1f))
            ReportCard(false, navController, modifier.weight(1f))
        }
    }
}

/**
 * Tarjeta seleccionable que representa una opción de tipo de reporte.
 *
 * Su apariencia y destino dependen de [anonymous]
 *
 * @param anonymous `true` para la opción de reporte anónimo; `false` para la opción de reporte
 * con seguimiento.
 * @param navController Controlador de navegación usado para ir a la pantalla de la opción elegida.
 */

@Composable
fun ReportCard(anonymous: Boolean, navController: NavController, modifier: Modifier = Modifier) {
    val bgColor = if (anonymous) {
        MaterialTheme.colorScheme.surfaceContainerHigh
    } else {
        MaterialTheme.colorScheme.primaryContainer
    }

    val contentColor = if (anonymous) {
        MaterialTheme.colorScheme.onSurfaceVariant
    } else {
        MaterialTheme.colorScheme.primary
    }

    val (optionType, optionDesc) = if (anonymous) {
        "Anónimo" to "Sin datos personales"
    } else {
        "Con seguimiento" to "Recibe tu folio"
    }

    val icon = if (anonymous) {
        Icons.Filled.PersonOff
    } else {
        Icons.Filled.Person
    }

//    TODO: Los que hagan los reportes, pongan aqui sus rutas a sus formularios
    val routeToGo = if (anonymous) {
        Pantalla.RUTA_ANONIMOUBICACION
    } else {
        Pantalla.RUTA_SEGUIMIENTO
    }
    Card(
        modifier = modifier
            .padding(8.dp, 4.dp)
            .border(width = 2.dp,
                color = contentColor,
                shape = RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(
            containerColor = bgColor,
            contentColor = contentColor
        ),
        onClick = { navController.navigate(routeToGo) }
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(4.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .padding(8.dp)
                .background(color = bgColor, shape = RoundedCornerShape(16.dp))
        )
        {
            Icon(imageVector = icon, contentDescription = null, tint = contentColor)
            Text(
                text = optionType,
                color = contentColor
            )
            Text(
                text = optionDesc,
                color = contentColor
            )
        }
    }
}