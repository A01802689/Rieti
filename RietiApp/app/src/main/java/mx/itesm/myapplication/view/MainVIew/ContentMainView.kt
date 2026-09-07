package mx.itesm.myapplication.view.MainVIew

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.ScrollableState
import androidx.compose.foundation.gestures.scrollable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SegmentedButtonDefaults.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ContentMainView(modifier: Modifier = Modifier){
    Column (verticalArrangement = Arrangement.spacedBy(4.dp),
        modifier = modifier.verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally) {
        ReportSummaryCard(
            folio = "R-2408-001",
            city = "Guadalajara",
            location = "Mercado Corona, Sector Hidalgo",
            tags = listOf("Venta ambulante", "3 NNA · 6–11 años"),
            status = "En seguimiento",
            hasRisk = true,
            dateText = "14 ago 2026 · 11:32 hrs",
        )
        ReportSummaryCard(
            folio = "R-2408-001",
            city = "Guadalajara",
            location = "Mercado Corona, Sector Hidalgo",
            tags = listOf("Venta ambulante", "3 NNA · 6–11 años"),
            status = "En seguimiento",
            hasRisk = true,
            dateText = "14 ago 2026 · 11:32 hrs",
        )
        ReportSummaryCard(
            folio = "R-2408-001",
            city = "Guadalajara",
            location = "Mercado Corona, Sector Hidalgo",
            tags = listOf("Venta ambulante", "3 NNA · 6–11 años"),
            status = "En seguimiento",
            hasRisk = true,
            dateText = "14 ago 2026 · 11:32 hrs",
        )
    }
}

@Composable
fun ReportSummaryCard(
    folio: String,
    city: String,
    location: String,
    tags: List<String>,
    status: String,
    hasRisk: Boolean,
    dateText: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerHigh
        )
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = folio,
                    color = MaterialTheme.colorScheme.primary,
                    style = MaterialTheme.typography.titleSmall
                )
                StatusChip(status)
            }

            Text(
                text = city,
                color = MaterialTheme.colorScheme.onSurface,
                style = MaterialTheme.typography.headlineSmall
            )

            Text(
                text = location,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                tags.forEach { tag ->
                    TagChip(tag)
                }
            }

            if (hasRisk) {
                RiskChip()
            }

            Text(
                text = dateText,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun StatusChip(status: String, modifier: Modifier = Modifier) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        modifier = modifier
            .background(
                color = MaterialTheme.colorScheme.primaryContainer,
                shape = RoundedCornerShape(50)
            )
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .background(color = MaterialTheme.colorScheme.primary, shape = CircleShape)
        )
        Text(text = status, color = MaterialTheme.colorScheme.primary)
    }
}

@Composable
fun TagChip(text: String, modifier: Modifier = Modifier) {
    Text(
        text = text,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = modifier
            .background(
                color = MaterialTheme.colorScheme.surfaceContainerHighest,
                shape = RoundedCornerShape(50)
            )
            .padding(horizontal = 12.dp, vertical = 6.dp)
    )
}

@Composable
fun RiskChip(modifier: Modifier = Modifier) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        modifier = modifier
            .background(
                color = MaterialTheme.colorScheme.errorContainer,
                shape = RoundedCornerShape(50)
            )
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Icon(
            imageVector = Icons.Filled.Warning,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.error
        )
        Text(text = "Riesgo reportado", color = MaterialTheme.colorScheme.error)
    }
}