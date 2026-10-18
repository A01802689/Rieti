package mx.itesm.myapplication.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext

private val EsquemaClaro = lightColorScheme(
    primary = TurquesaProfundo, onPrimary = Color.White,
    primaryContainer = TurquesaSuave, onPrimaryContainer = Tinta,
    secondary = Violeta, onSecondary = Color.White,
    secondaryContainer = VioletaSuave, onSecondaryContainer = Tinta,
    background = Fondo, onBackground = Tinta,
    surface = Color.White, onSurface = Tinta,
    surfaceVariant = Color(0xFFEEF1F6), onSurfaceVariant = TintaSecundaria,
    surfaceContainerLowest = Color.White,
    surfaceContainerLow = Color(0xFFF1F4F9),
    surfaceContainer = Color(0xFFEEF1F7),
    surfaceContainerHigh = Color(0xFFE9EDF4),
    surfaceContainerHighest = Color(0xFFE3E8F0),
    outline = Color(0xFF8A869C), outlineVariant = Linea,
    error = Alerta, onError = Color.White,
    errorContainer = AlertaSuave, onErrorContainer = Color(0xFF410E0B)
)

private val EsquemaOscuro = darkColorScheme(
    primary = Color(0xFF4DC9D8), onPrimary = Color(0xFF00363D),
    primaryContainer = Color(0xFF004F58), onPrimaryContainer = Color(0xFFBFF1F7),
    secondary = Color(0xFFB9A7F0), onSecondary = Color(0xFF2A1B55),
    secondaryContainer = Color(0xFF3D2F66), onSecondaryContainer = Color(0xFFE6DEFF),
    background = Color(0xFF14121F), onBackground = Color(0xFFECEAF4),
    surface = Color(0xFF1C1A2A), onSurface = Color(0xFFECEAF4),
    surfaceVariant = Color(0xFF2A2840), onSurfaceVariant = Color(0xFFC8C4DA),
    surfaceContainerLowest = Color(0xFF0F0D18),
    surfaceContainerLow = Color(0xFF1A1826),
    surfaceContainer = Color(0xFF201E2F),
    surfaceContainerHigh = Color(0xFF28263A),
    surfaceContainerHighest = Color(0xFF312F45),
    outline = Color(0xFF8F8BA3), outlineVariant = Color(0xFF3A3750),
    error = Color(0xFFFFB4AB), onError = Color(0xFF690005),
    errorContainer = Color(0xFF93000A), onErrorContainer = Color(0xFFFFDAD6)
)

// Esquinas con jerarquía: campos y chips más cerradas, tarjetas y paneles más redondeadas.
private val Formas = Shapes(
    extraSmall = RoundedCornerShape(12.dp), // campos de texto
    small = RoundedCornerShape(10.dp),      // chips
    medium = RoundedCornerShape(16.dp),     // tarjetas
    large = RoundedCornerShape(24.dp)       // paneles y opciones grandes
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if(darkTheme) EsquemaOscuro else EsquemaClaro,
        typography = Tipografia,
        shapes = Formas
    ){
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background,
            content = content
        )
    }
}