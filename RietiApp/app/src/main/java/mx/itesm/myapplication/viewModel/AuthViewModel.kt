package mx.itesm.myapplication.viewModel

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import mx.itesm.myapplication.model.AuthScreenState

//Esto basicamnete es como decide qué pantalla se debe mostrar
class AuthViewModel : ViewModel() {
    private val _currentScreen = MutableStateFlow(AuthScreenState.LOGIN)
    val currentScreen: StateFlow<AuthScreenState> = _currentScreen

    fun selectLogin() {
        _currentScreen.value = AuthScreenState.LOGIN
    }
    fun selectRegister() {
        _currentScreen.value = AuthScreenState.REGISTER
    }
}