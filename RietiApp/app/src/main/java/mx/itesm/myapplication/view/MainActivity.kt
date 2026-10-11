package mx.itesm.myapplication.view

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import mx.itesm.myapplication.ui.theme.MyApplicationTheme

/**
 * Actividad principal de la aplicación Android Rieti.
 *
 * Configura la experiencia Edge-to-Edge y establece el contenido declarativo mediante Jetpack Compose.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                AppPrincipal()
            }
        }
    }
}

/**
 * Composable raíz que inicializa el controlador de navegación [rememberNavController]
 * y renderiza el contenedor [Surface] principal con [AppNavHost].
 *
 * @param modifier Modificador opcional de diseño.
 */
@Composable
fun AppPrincipal(modifier: Modifier = Modifier) {
    val navController = rememberNavController()
    Surface(
        modifier = modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        AppNavHost(
            navController = navController,
            modifier = modifier
                .statusBarsPadding()
                .fillMaxSize()
        )
    }
}
