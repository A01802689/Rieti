package mx.itesm.myapplication.view

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import mx.itesm.myapplication.view.MainVIew.MainView
import mx.itesm.myapplication.view.seguimiento.ReporteSeguimiento
import mx.itesm.myapplication.view.seguimiento.SeguimientoEnviar
import mx.itesm.myapplication.view.seguimiento.SeguimientoUbicacion

@Composable
fun AppNavHost(navController: NavHostController, modifier: Modifier = Modifier) {
    NavHost(
        navController = navController,
        startDestination = Pantalla.RUTA_LOGIN,
        modifier = modifier.fillMaxSize()
    ) {
        composable(Pantalla.RUTA_LOGIN) {
            LoginForm(navController)
        }
        composable(Pantalla.RUTA_REGISTER) {
            RegisterForm(navController)
        }
        composable(Pantalla.RUTA_MAIN) {
            MainView(navController, modifier)
        }
        composable(Pantalla.RUTA_SEGUIMIENTO) {
            ReporteSeguimiento(navController)
        }
        composable(Pantalla.RUTA_SEGUBICACION){
            SeguimientoUbicacion(navController)
        }
        composable(Pantalla.RUTA_SEGENVIAR) {
            SeguimientoEnviar(navController)
        }
        composable(Pantalla.RUTA_REPORT2) {
            reportePantallaB(navController)
        }
    }
}