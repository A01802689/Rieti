package mx.itesm.myapplication.view.mainVIew

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PersonOff
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import mx.itesm.myapplication.ui.theme.TurquesaProfundo
import mx.itesm.myapplication.ui.theme.TurquesaSuave
import mx.itesm.myapplication.ui.theme.Violeta
import mx.itesm.myapplication.ui.theme.VioletaSuave
import mx.itesm.myapplication.view.Pantalla

/**
 * Vista principal para elegir el tipo de reporte que se quiere enviar.
 *
 *
 */

@Composable
fun GenerateReportMainView(navController: NavController, modifier: Modifier = Modifier) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 8.dp
    ){
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
                "¿Qué tipo de reporte quieres enviar?",
                style = MaterialTheme.typography.titleMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
            Row(
                modifier = Modifier.fillMaxWidth().height(IntrinsicSize.Max),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                ReportCard(true, navController, Modifier.weight(1f).fillMaxHeight())
                ReportCard(false, navController, Modifier.weight(1f).fillMaxWidth())
            }
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
    val acento = if (anonymous) Violeta else TurquesaProfundo
    val fondoIcono = if (anonymous) VioletaSuave else TurquesaSuave
    val icono = if (anonymous) Icons.Filled.PersonOff else Icons.Filled.Person
    val (titulo, descripcion) =
        if (anonymous) "Anónimo" to "Sin datos personales" else "Con seguimiento" to "Recibe tu folio"
    val ruta = if (anonymous) Pantalla.RUTA_ANONIMOUBICACION else Pantalla.RUTA_SEGUIMIENTO

    Card(
        onClick = { navController.navigate(ruta) },
        modifier = modifier,
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.5.dp, acento),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 14.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(
                modifier = Modifier.size(40.dp).background(fondoIcono, CircleShape),
                contentAlignment = Alignment.Center
            ) { Icon(icono, contentDescription = null, tint = acento) }
            Text(titulo, style = MaterialTheme.typography.titleMedium, textAlign = TextAlign.Center)
            Text(
                descripcion,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
        }
    }
}
