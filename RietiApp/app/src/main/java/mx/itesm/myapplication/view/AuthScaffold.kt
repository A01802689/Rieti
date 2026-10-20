package mx.itesm.myapplication.view

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController

/**
 * Estructura base ([Scaffold]) reutilizable para las pantallas de autenticación (login y registro)
 *
 * Renderiza el encabezado [AppHeader] y las pestañas [AuthTabsBar] en la barra superior
 *
 * @param navController Controlador de navegación [NavHostController] para alternar entre login y registro
 * @param modifier Modificador opcional de diseño
 * @param content Contenido que recibe los [PaddingValues] proporcionados por el [Scaffold]
 */
@Composable
fun AuthScaffold(
    navController: NavHostController,
    modifier: Modifier = Modifier,
    content: @Composable (PaddingValues) -> Unit
) {
    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            Column {
                Spacer(modifier = Modifier.height(32.dp))
                AppHeader()
                Spacer(modifier = Modifier.height(16.dp))
                AuthTabsBar(navController)
            }
        },
        content = content
    )
}
