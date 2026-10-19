package mx.itesm.myapplication.view.mainVIew

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import mx.itesm.myapplication.R
import mx.itesm.myapplication.ui.theme.DegradadoEncabezado
import mx.itesm.myapplication.ui.theme.DegradadoEncabezadoOscuro
import mx.itesm.myapplication.view.Pantalla
import mx.itesm.myapplication.viewModel.AuthViewModel

/**
 * Barra superior de la pantalla principal.
 *
 * Muestra el logotipo institucional de RIETI junto con los títulos de la pantalla
 * y el botón para cerrar sesión / volver al inicio.
 *
 * @param navController Controlador de navegación para manejar la navegación entre pantallas.
 * @param modifier [Modifier] opcional para personalizar el diseño.
 */
@Composable
fun TopMainView(navController: NavController, modifier: Modifier = Modifier) {
    val authVm: AuthViewModel = viewModel()
    Row(
        modifier = modifier.fillMaxWidth()
            .clip(RoundedCornerShape(bottomStart = 28.dp, bottomEnd = 28.dp))
            .background(if (isSystemInDarkTheme()) DegradadoEncabezadoOscuro else DegradadoEncabezado)
            .padding(horizontal = 20.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(
            shape = RoundedCornerShape(14.dp), color = Color.White
        ) {
            Image(
                painter = painterResource(id = R.drawable.logo_rieti_atizapan),
                contentDescription = "Logo RIETI",
                modifier = Modifier.size(52.dp).padding(6.dp)
            )
        }
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text("Sistema RIETI", style = MaterialTheme.typography.headlineSmall, color = Color.White)
            Text("Mis Reportes", style = MaterialTheme.typography.titleMedium, color = Color.White)
        }
        IconButton(
            onClick = {
                authVm.logout()
                navController.navigate(Pantalla.Login.ruta) {
                    popUpTo(0) { inclusive = true } }
            }) {
            Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = "Cerrar sesión", tint = Color.White)
            }
        }
    }
