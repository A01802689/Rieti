package mx.itesm.myapplication.view

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import mx.itesm.myapplication.R

/**
 * Componente Composable que muestra el encabezado oficial de la aplicación RIETI,
 * incluyendo la imagen/logo arriba del título "RIETI" y el subtítulo representativo
 */
@Composable
fun AppHeader() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Image(
            painter = painterResource(id = R.drawable.logo_rieti_atizapan),
            contentDescription = "Logo RIETI",
            contentScale = ContentScale.Fit,
            modifier = Modifier
                .height(150.dp)
                .padding(bottom = 8.dp)
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = "Sistema ciudadano de reportes",
            fontSize = 15.sp,
            textAlign = TextAlign.Center
        )
    }
}
