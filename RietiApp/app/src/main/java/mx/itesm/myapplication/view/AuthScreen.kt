package mx.itesm.myapplication.view

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import mx.itesm.myapplication.model.AuthScreenState
import mx.itesm.myapplication.viewModel.AuthViewModel

@Composable
fun AuthScreen(
    modifier: Modifier = Modifier,
    viewModel: AuthViewModel = viewModel()
) {
    val currentScreen by viewModel.currentScreen.collectAsState()

    Column(modifier = modifier.fillMaxSize()) {
        Spacer(modifier = Modifier.height(100.dp)) //mueve todo

        AppHeader()

        Spacer(modifier = Modifier.height(24.dp))

        AuthTabs(
            currentScreen = currentScreen,
            onLoginClick = { viewModel.selectLogin() },
            onRegisterClick = { viewModel.selectRegister() }
        )

        Spacer(modifier = Modifier.height(24.dp))

        when (currentScreen) { //Toma el estado que esta actualmente
            AuthScreenState.LOGIN -> LoginForm() //si es login usa la funcion loginForm que definimos en AuthForms.kt
            AuthScreenState.REGISTER -> RegisterForm() //Lo mismo pero con el otro estado.
        }
    }
}