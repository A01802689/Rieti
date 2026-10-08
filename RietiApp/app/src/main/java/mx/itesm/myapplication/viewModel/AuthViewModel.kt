package mx.itesm.myapplication.viewModel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import mx.itesm.myapplication.data.network.ApiClient
import mx.itesm.myapplication.data.network.models.UsuarioCreateRequest
import mx.itesm.myapplication.data.network.models.UsuarioLoginRequest
import mx.itesm.myapplication.data.network.models.UsuarioResponse

sealed interface AuthUiState {
    object Idle : AuthUiState
    object Loading : AuthUiState
    data class Success(val usuario: UsuarioResponse) : AuthUiState
    data class Error(val message: String) : AuthUiState
}

class AuthViewModel : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun login(correo: String, contrasena: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            try {
                val request = UsuarioLoginRequest(correo = correo, contrasena = contrasena)
                val response = ApiClient.apiService.login(request)
                if (response.isSuccessful && response.body() != null) {
                    // El CookieJar de OkHttp ya habrá guardado automáticamente la cookie 'access_token'
                    _uiState.value = AuthUiState.Success(response.body()!!)
                } else {
                    val errorMsg = response.errorBody()?.string() ?: "Error de autenticación (${response.code()})"
                    _uiState.value = AuthUiState.Error(errorMsg)
                }
            } catch (e: Exception) {
                _uiState.value = AuthUiState.Error(e.localizedMessage ?: "Error de conexión")
            }
        }
    }

    fun registrar(nombre: String, apellido: String, correo: String, contrasena: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            try {
                val request = UsuarioCreateRequest(
                    nombre = nombre,
                    apellido = apellido,
                    correo = correo,
                    contrasena = contrasena
                )
                val response = ApiClient.apiService.crearUsuario(request)
                if (response.isSuccessful && response.body() != null) {
                    _uiState.value = AuthUiState.Success(response.body()!!)
                } else {
                    val errorMsg = response.errorBody()?.string() ?: "Error al registrar usuario (${response.code()})"
                    _uiState.value = AuthUiState.Error(errorMsg)
                }
            } catch (e: Exception) {
                _uiState.value = AuthUiState.Error(e.localizedMessage ?: "Error de conexión")
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            try {
                ApiClient.apiService.logout()
            } catch (_: Exception) {
            } finally {
                ApiClient.clearCookies()
                _uiState.value = AuthUiState.Idle
            }
        }
    }

    fun resetState() {
        _uiState.value = AuthUiState.Idle
    }
}
