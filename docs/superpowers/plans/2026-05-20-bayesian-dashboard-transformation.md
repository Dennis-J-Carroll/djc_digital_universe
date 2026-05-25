# Bayesian Dashboard Transformation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Seattle-only Bayesian dashboard into universal, always-on analytics platform with CSV upload, real PyMC predictions, and Modern Neutral theme.

**Architecture:** Risk-first approach: (1) Fix sleep via HF Spaces, (2) Refactor monolith into modular structure, (3) Add CSV upload with schema detection, (4) Implement real Bayesian predictions from PyMC posterior.

**Tech Stack:** Python 3.10+, Streamlit 1.38, PyMC 5.10, ArviZ 0.17, Plotly 5.18, pandas 2.1

**Repo:** `bayesian-analysis-of-airbnb-seattle-market/`

---

## Phase 1: HuggingFace Spaces Migration (~5 hours)

**Goal:** Deploy to HF Spaces for always-on hosting. No more sleep.

### Task 1.1: HF Spaces Infrastructure Files

**Files:**
- Create: `requirements.txt` (root)
- Create: `packages.txt` (root)
- Create: `app.py` (root)
- Modify: `README.md` (root)

- [ ] **Step 1: Consolidate requirements.txt**

```bash
# Current repo has multiple requirements files - consolidate into one
cat > requirements.txt << 'EOF'
streamlit==1.38.0
pandas==2.1.4
numpy==1.26.2
plotly==5.18.0
pymc==5.10.3
arviz==0.17.0
scipy==1.11.4
pyyaml==6.0.1
xarray==2023.12.0
netCDF4==1.6.5
EOF
```

- [ ] **Step 2: Create packages.txt for system dependencies**

```bash
cat > packages.txt << 'EOF'
build-essential
libblas-dev
liblapack-dev
EOF
```

- [ ] **Step 3: Create HF Spaces entry point**

```python
# app.py (root level)
"""
HuggingFace Spaces entry point.
Delegates to dashboard/app.py for actual application.
"""
import sys
from pathlib import Path

# Add dashboard to path
sys.path.insert(0, str(Path(__file__).parent))

from dashboard.app import main

if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Update README with HF Spaces frontmatter**

```bash
cat > README.md << 'EOF'
---
title: Bayesian Airbnb Price Intelligence
emoji: 🏠
colorFrom: blue
colorTo: green
sdk: streamlit
sdk_version: 1.38.0
app_file: app.py
pinned: false
---

# Seattle Airbnb Price Intelligence Dashboard

Enterprise-grade hierarchical Bayesian analytics with uncertainty quantification.

- 6,144 listings across 88 neighborhoods
- PyMC hierarchical Bayesian model (R²=0.687)
- Real-time filtering and ROI analysis
- CSV upload for custom datasets

[GitHub Repository](https://github.com/yourusername/bayesian-analysis-dashboard)
EOF
```

- [ ] **Step 5: Commit infrastructure files**

```bash
git add requirements.txt packages.txt app.py README.md
git commit -m "feat(hosting): add HuggingFace Spaces infrastructure

- Consolidate requirements to single file
- Add system dependencies (packages.txt)
- Create HF Spaces entry point
- Update README with Space card frontmatter

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 1.2: Minimal Theme Updates

**Files:**
- Modify: `.streamlit/config.toml`
- Modify: `dashboard/app.py` (or `expert_dashboard.py` if current structure)

- [ ] **Step 1: Update Streamlit config for white background**

```toml
# .streamlit/config.toml
[theme]
primaryColor = "#77b899"           # Sage green (keep)
backgroundColor = "#ffffff"         # White (was beige)
secondaryBackgroundColor = "#f8f9fa" # Light gray cards
textColor = "#212529"              # Dark text
font = "sans serif"
base = "light"

[server]
headless = true
port = 7860  # HF Spaces default
enableCORS = false
```

- [ ] **Step 2: Add minimal CSS injection to current dashboard**

Find the main dashboard file (`expert_dashboard.py` or `dashboard/app.py`) and add:

```python
def inject_minimal_theme():
    """Phase 1 minimal theme - white background + sage green accents."""
    st.markdown("""
    <style>
    .stMetric {
        background: white;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 3px solid #77b899;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .insight-box {
        background: #f0fdf7;
        border-left: 3px solid #77b899;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
    }
    </style>
    """, unsafe_allow_html=True)

# Call in main() before rendering:
inject_minimal_theme()
```

- [ ] **Step 3: Test locally**

```bash
streamlit run app.py
# Verify:
# - App loads
# - White background appears
# - Sage green accents on metrics
# - All 6 pages accessible
```

- [ ] **Step 4: Commit theme updates**

```bash
git add .streamlit/config.toml dashboard/app.py  # or expert_dashboard.py
git commit -m "style: apply minimal Modern Neutral theme

- White background (was beige)
- Light gray card backgrounds
- Sage green accent (#77b899)
- Clean metric styling

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 1.3: Deploy to HuggingFace Spaces

- [ ] **Step 1: Create HF Space**

Manual step - user creates Space at:
`https://huggingface.co/spaces/[username]/bayesian-airbnb-dashboard`

Settings:
- SDK: Streamlit
- Hardware: CPU Basic (free)
- Connect to GitHub repo

- [ ] **Step 2: Push to trigger deployment**

```bash
git push origin main
# HF Spaces auto-deploys on push
```

- [ ] **Step 3: Verify deployment**

Wait for build (2-5 minutes), then test:
- Dashboard loads at HF Spaces URL
- All 6 pages render correctly
- Filters work (neighborhood, room type, price)
- Charts display
- Leave idle for 24h, verify no sleep

---

## Phase 2: Modular Refactor + Visual Redesign (~37.5 hours)

**Goal:** Transform monolith into pages/components/utils structure. Complete Modern Neutral + dark mode.

### Task 2.1: Create Directory Structure

**Files:**
- Create: `dashboard/__init__.py`
- Create: `dashboard/pages/__init__.py`
- Create: `dashboard/components/__init__.py`
- Create: `dashboard/utils/__init__.py`
- Create: `dashboard/config/__init__.py`

- [ ] **Step 1: Create directories**

```bash
mkdir -p dashboard/{pages,components,utils,config}
touch dashboard/{__init__.py,pages/__init__.py,components/__init__.py,utils/__init__.py,config/__init__.py}
```

- [ ] **Step 2: Commit structure**

```bash
git add dashboard/
git commit -m "refactor: create modular directory structure

- dashboard/pages/ for page logic
- dashboard/components/ for reusable UI
- dashboard/utils/ for business logic
- dashboard/config/ for YAML configs

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 2.2: Exception Hierarchy

**Files:**
- Create: `dashboard/utils/exceptions.py`
- Create: `tests/test_exceptions.py`

- [ ] **Step 1: Write test for exception hierarchy**

```python
# tests/test_exceptions.py
import pytest
from dashboard.utils.exceptions import (
    DashboardException,
    ValidationError,
    ColumnMappingError,
    InsufficientDataError,
    ModelLoadError,
    PredictionError
)

def test_exception_hierarchy():
    """All exceptions inherit from DashboardException."""
    assert issubclass(ValidationError, DashboardException)
    assert issubclass(ColumnMappingError, ValidationError)
    assert issubclass(InsufficientDataError, ValidationError)
    assert issubclass(ModelLoadError, DashboardException)
    assert issubclass(PredictionError, DashboardException)

def test_column_mapping_error_stores_missing():
    """ColumnMappingError stores missing column list."""
    missing = ["price", "neighborhood"]
    err = ColumnMappingError(missing)
    assert err.missing_columns == missing
    assert "price" in str(err)
    assert "neighborhood" in str(err)

def test_insufficient_data_error_stores_counts():
    """InsufficientDataError stores row counts."""
    err = InsufficientDataError(rows=30, min_required=50)
    assert err.rows == 30
    assert err.min_required == 50
    assert "30" in str(err)
    assert "50" in str(err)
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pytest tests/test_exceptions.py -v
# Expected: ModuleNotFoundError: No module named 'dashboard.utils.exceptions'
```

- [ ] **Step 3: Implement exception hierarchy**

```python
# dashboard/utils/exceptions.py
"""Custom exception hierarchy for dashboard errors."""

class DashboardException(Exception):
    """Base exception for all dashboard errors."""
    pass

class ValidationError(DashboardException):
    """Data validation failed."""
    pass

class ColumnMappingError(ValidationError):
    """Required column not found or mapping failed."""
    
    def __init__(self, missing_columns: list[str]):
        self.missing_columns = missing_columns
        super().__init__(f"Missing required columns: {', '.join(missing_columns)}")

class InsufficientDataError(ValidationError):
    """Dataset too small for analysis."""
    
    def __init__(self, rows: int, min_required: int = 50):
        self.rows = rows
        self.min_required = min_required
        super().__init__(f"Dataset has {rows} rows, minimum {min_required} required")

class ModelLoadError(DashboardException):
    """PyMC model failed to load."""
    pass

class PredictionError(DashboardException):
    """Prediction generation failed."""
    pass
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pytest tests/test_exceptions.py -v
# Expected: 3 passed
```

- [ ] **Step 5: Commit exceptions**

```bash
git add dashboard/utils/exceptions.py tests/test_exceptions.py
git commit -m "feat: add custom exception hierarchy

- DashboardException base class
- ValidationError for data issues
- ColumnMappingError stores missing columns
- InsufficientDataError stores row counts
- ModelLoadError, PredictionError

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 2.3: Session Manager

**Files:**
- Create: `dashboard/utils/session_manager.py`
- Create: `tests/test_session_manager.py`

- [ ] **Step 1: Write test for session manager**

```python
# tests/test_session_manager.py
import pytest
import pandas as pd
from unittest.mock import MagicMock
from dashboard.utils.session_manager import AppState

def test_appstate_keys_are_strings():
    """All AppState keys are string constants."""
    assert isinstance(AppState.DATA_SOURCE, str)
    assert isinstance(AppState.UPLOADED_DF, str)
    assert isinstance(AppState.THEME, str)

def test_appstate_init_sets_defaults(monkeypatch):
    """init() sets default values in session_state."""
    mock_st = MagicMock()
    mock_st.session_state = {}
    monkeypatch.setattr("dashboard.utils.session_manager.st", mock_st)
    
    AppState.init()
    
    assert mock_st.session_state[AppState.DATA_SOURCE] == "default"
    assert mock_st.session_state[AppState.THEME] == "modern_neutral"
    assert mock_st.session_state[AppState.UPLOAD_VALIDATED] == False

def test_get_active_df_returns_uploaded_when_set(monkeypatch):
    """get_active_df() returns uploaded df when DATA_SOURCE='uploaded'."""
    mock_st = MagicMock()
    test_df = pd.DataFrame({"price": [100, 200]})
    mock_st.session_state = {
        AppState.DATA_SOURCE: "uploaded",
        AppState.UPLOADED_DF: test_df,
        "default_df": pd.DataFrame({"price": [999]})
    }
    monkeypatch.setattr("dashboard.utils.session_manager.st", mock_st)
    
    result = AppState.get_active_df()
    
    assert result.equals(test_df)

def test_get_active_df_returns_default_when_no_upload(monkeypatch):
    """get_active_df() returns default df when no upload."""
    mock_st = MagicMock()
    default_df = pd.DataFrame({"price": [999]})
    mock_st.session_state = {
        AppState.DATA_SOURCE: "default",
        "default_df": default_df
    }
    monkeypatch.setattr("dashboard.utils.session_manager.st", mock_st)
    
    result = AppState.get_active_df()
    
    assert result.equals(default_df)

def test_get_active_df_handles_corrupted_upload(monkeypatch):
    """get_active_df() falls back to default if uploaded df is None."""
    mock_st = MagicMock()
    default_df = pd.DataFrame({"price": [999]})
    mock_st.session_state = {
        AppState.DATA_SOURCE: "uploaded",
        AppState.UPLOADED_DF: None,  # Corrupted state
        "default_df": default_df
    }
    monkeypatch.setattr("dashboard.utils.session_manager.st", mock_st)
    
    result = AppState.get_active_df()
    
    # Should reset to default and return default_df
    assert mock_st.session_state[AppState.DATA_SOURCE] == "default"
    assert result.equals(default_df)
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pytest tests/test_session_manager.py -v
# Expected: ModuleNotFoundError or import errors
```

- [ ] **Step 3: Implement session manager**

```python
# dashboard/utils/session_manager.py
"""Type-safe session state management."""
from dataclasses import dataclass
from typing import Optional
import streamlit as st
import pandas as pd

@dataclass
class AppState:
    """Type-safe session state keys."""
    DATA_SOURCE: str = "data_source"        # "default" | "uploaded"
    UPLOADED_DF: str = "uploaded_df"
    COLUMN_MAP: str = "column_map"
    MODEL: str = "model"
    THEME: str = "theme"                    # "modern_neutral" | "deep_forest"
    CURRENT_PAGE: str = "current_page"
    UPLOAD_VALIDATED: str = "upload_validated"
    
    @staticmethod
    def init():
        """Initialize session state with defaults."""
        defaults = {
            AppState.DATA_SOURCE: "default",
            AppState.THEME: "modern_neutral",
            AppState.CURRENT_PAGE: "overview",
            AppState.UPLOAD_VALIDATED: False,
        }
        for key, val in defaults.items():
            if key not in st.session_state:
                st.session_state[key] = val
    
    @staticmethod
    def get_active_df() -> pd.DataFrame:
        """Get currently active DataFrame (uploaded or default)."""
        if st.session_state.get(AppState.DATA_SOURCE) == "uploaded":
            uploaded = st.session_state.get(AppState.UPLOADED_DF)
            if uploaded is not None:
                return uploaded
            # Fallback if corrupted
            st.session_state[AppState.DATA_SOURCE] = "default"
        return st.session_state["default_df"]
    
    @staticmethod
    def reset_to_default():
        """Clear uploaded data, reset to default dataset."""
        for key in [AppState.UPLOADED_DF, AppState.COLUMN_MAP]:
            st.session_state.pop(key, None)
        st.session_state[AppState.DATA_SOURCE] = "default"
        st.rerun()
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pytest tests/test_session_manager.py -v
# Expected: 6 passed
```

- [ ] **Step 5: Commit session manager**

```bash
git add dashboard/utils/session_manager.py tests/test_session_manager.py
git commit -m "feat: add type-safe session state manager

- AppState dataclass with string constants
- init() sets defaults
- get_active_df() returns uploaded or default
- reset_to_default() clears upload state
- Guards against None/corrupted state

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 2.4: Theme System Foundation

**Files:**
- Create: `dashboard/config/themes.yaml`
- Create: `dashboard/utils/styling.py`
- Create: `tests/test_styling.py`

- [ ] **Step 1: Create themes.yaml**

```yaml
# dashboard/config/themes.yaml
modern_neutral:
  name: "Modern Neutral"
  is_dark: false
  colors:
    bg_primary: "#ffffff"
    bg_secondary: "#f8f9fa"
    bg_sidebar: "#f1f3f5"
    bg_card: "#ffffff"
    text_primary: "#212529"
    text_secondary: "#6c757d"
    text_muted: "#adb5bd"
    accent: "#77b899"
    accent_hover: "#5fa081"
    success: "#198754"
    warning: "#ffc107"
    danger: "#dc3545"
    border: "#dee2e6"
    shadow: "0 1px 3px rgba(0,0,0,0.12)"
  chart:
    template: "plotly_white"
    palette: ["#77b899", "#0d6efd", "#fd7e14", "#6f42c1", "#d63384"]

deep_forest:
  name: "Deep Forest"
  is_dark: true
  colors:
    bg_primary: "#1a1a2e"
    bg_secondary: "#16213e"
    bg_sidebar: "#0f1419"
    bg_card: "#16213e"
    text_primary: "#e0e0e0"
    text_secondary: "#a0a0a0"
    text_muted: "#6c757d"
    accent: "#77b899"
    accent_hover: "#8fd4ae"
    success: "#198754"
    warning: "#ffc107"
    danger: "#dc3545"
    border: "#2d2d44"
    shadow: "0 2px 8px rgba(0,0,0,0.4)"
  chart:
    template: "plotly_dark"
    palette: ["#77b899", "#8ecae6", "#ff9f40", "#a78bfa", "#f472b6"]
```

- [ ] **Step 2: Write test for styling**

```python
# tests/test_styling.py
import pytest
from pathlib import Path
from dashboard.utils.styling import load_theme_config, get_chart_template, get_chart_palette

def test_load_theme_config_returns_dict():
    """load_theme_config() returns theme dict."""
    theme = load_theme_config("modern_neutral")
    assert isinstance(theme, dict)
    assert "colors" in theme
    assert "chart" in theme

def test_modern_neutral_theme_structure():
    """Modern Neutral has required structure."""
    theme = load_theme_config("modern_neutral")
    assert theme["is_dark"] == False
    assert theme["colors"]["bg_primary"] == "#ffffff"
    assert theme["colors"]["accent"] == "#77b899"
    assert theme["chart"]["template"] == "plotly_white"
    assert isinstance(theme["chart"]["palette"], list)

def test_deep_forest_theme_structure():
    """Deep Forest has required structure."""
    theme = load_theme_config("deep_forest")
    assert theme["is_dark"] == True
    assert theme["colors"]["bg_primary"] == "#1a1a2e"
    assert theme["chart"]["template"] == "plotly_dark"

def test_get_chart_template():
    """get_chart_template() returns correct template."""
    assert get_chart_template("modern_neutral") == "plotly_white"
    assert get_chart_template("deep_forest") == "plotly_dark"

def test_get_chart_palette():
    """get_chart_palette() returns color list."""
    palette = get_chart_palette("modern_neutral")
    assert isinstance(palette, list)
    assert len(palette) == 5
    assert palette[0] == "#77b899"  # Sage green first
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pytest tests/test_styling.py -v
# Expected: ModuleNotFoundError
```

- [ ] **Step 4: Implement styling module**

```python
# dashboard/utils/styling.py
"""Theme system with CSS variable injection."""
import streamlit as st
import yaml
from pathlib import Path

def load_theme_config(theme_name: str) -> dict:
    """Load theme configuration from YAML."""
    config_path = Path(__file__).parent.parent / "config" / "themes.yaml"
    with open(config_path) as f:
        themes = yaml.safe_load(f)
    return themes.get(theme_name, themes["modern_neutral"])

def apply_theme(theme_name: str = "modern_neutral"):
    """Apply CSS theme via st.markdown."""
    theme = load_theme_config(theme_name)
    colors = theme["colors"]
    
    css = f"""
    <style>
    /* WARNING: Targets Streamlit 1.38.0 internal DOM */
    :root {{
        --bg-primary: {colors['bg_primary']};
        --bg-secondary: {colors['bg_secondary']};
        --bg-sidebar: {colors['bg_sidebar']};
        --bg-card: {colors['bg_card']};
        --text-primary: {colors['text_primary']};
        --text-secondary: {colors['text_secondary']};
        --text-muted: {colors['text_muted']};
        --accent: {colors['accent']};
        --accent-hover: {colors['accent_hover']};
        --success: {colors['success']};
        --warning: {colors['warning']};
        --danger: {colors['danger']};
        --border: {colors['border']};
        --shadow: {colors['shadow']};
    }}
    
    .stApp {{
        background-color: var(--bg-primary);
        color: var(--text-primary);
    }}
    
    section[data-testid="stSidebar"] {{
        background-color: var(--bg-sidebar);
    }}
    
    div[data-testid="stMetric"] {{
        background: var(--bg-card);
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 3px solid var(--accent);
        box-shadow: var(--shadow);
    }}
    
    div[data-testid="stMetricLabel"] {{
        color: var(--text-secondary);
        font-size: 0.875rem;
        font-weight: 500;
    }}
    
    div[data-testid="stMetricValue"] {{
        color: var(--text-primary);
        font-size: 1.5rem;
        font-weight: 700;
    }}
    
    .insight-box {{
        background: {colors['bg_secondary']};
        border-left: 3px solid var(--accent);
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
    }}
    
    .insight-box-title {{
        color: var(--accent);
        font-weight: 600;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }}
    
    .insight-box-content {{
        color: var(--text-primary);
        font-size: 0.9375rem;
        line-height: 1.5;
    }}
    
    .stButton > button {{
        background-color: var(--accent);
        color: white;
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1.5rem;
        font-weight: 500;
        transition: all 0.2s;
    }}
    
    .stButton > button:hover {{
        background-color: var(--accent-hover);
        box-shadow: var(--shadow);
    }}
    
    h1, h2, h3 {{
        color: var(--text-primary);
    }}
    </style>
    """
    
    st.markdown(css, unsafe_allow_html=True)

def get_chart_template(theme_name: str = "modern_neutral") -> str:
    """Get Plotly template name for current theme."""
    theme = load_theme_config(theme_name)
    return theme["chart"]["template"]

def get_chart_palette(theme_name: str = "modern_neutral") -> list[str]:
    """Get color palette for charts."""
    theme = load_theme_config(theme_name)
    return theme["chart"]["palette"]
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pytest tests/test_styling.py -v
# Expected: 6 passed
```

- [ ] **Step 6: Commit theme system**

```bash
git add dashboard/config/themes.yaml dashboard/utils/styling.py tests/test_styling.py
git commit -m "feat: add theme system with CSS variables

- themes.yaml with modern_neutral + deep_forest
- apply_theme() injects CSS variables
- get_chart_template() for Plotly theming
- get_chart_palette() for chart colors

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.5: Extract Pages from Monolith

**Files:**
- Create: `dashboard/pages/overview.py`
- Create: `dashboard/pages/neighborhood.py`
- Create: `dashboard/pages/prediction.py`
- Create: `dashboard/pages/market_intel.py`
- Create: `dashboard/pages/business_strategy.py`
- Create: `dashboard/pages/model_insights.py`
- Create: `tests/test_pages.py`

- [ ] **Step 1: Write failing test for page structure**

```python
# tests/test_pages.py
def test_overview_page_structure():
    """Test overview page has required render function."""
    from dashboard.pages import overview
    
    assert hasattr(overview, "render")
    assert callable(overview.render)

def test_all_pages_have_render():
    """Test all pages export a render() function."""
    pages = ["overview", "neighborhood", "prediction", "market_intel", "business_strategy", "model_insights"]
    
    for page_name in pages:
        module = __import__(f"dashboard.pages.{page_name}", fromlist=["render"])
        assert hasattr(module, "render")
        assert callable(module.render)
```

- [ ] **Step 2: Run test expecting module not found**

```bash
pytest tests/test_pages.py::test_overview_page_structure -v
# Expected: ModuleNotFoundError: No module named 'dashboard.pages.overview'
```

- [ ] **Step 3: Extract overview page**

```python
# dashboard/pages/overview.py
"""Market overview page - KPIs, distributions, top neighborhoods."""
import streamlit as st
import pandas as pd
from ..utils.session_manager import AppState

def render():
    """Render market overview page."""
    st.title("Seattle Airbnb Market Overview")
    
    df = AppState.get_active_df()
    
    # Placeholder metrics until Task 2.6 builds components
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Listings", f"{len(df):,}")
    with col2:
        avg_price = df["price"].mean()
        st.metric("Avg Price", f"${avg_price:.0f}")
    with col3:
        neighborhoods = df["neighbourhood_cleansed"].nunique()
        st.metric("Neighborhoods", neighborhoods)
    with col4:
        occupancy = df["availability_365"].dropna().mean()
        st.metric("Avg Availability", f"{occupancy:.0f} days")
    
    st.info("Overview page extracted from monolith — components in Task 2.6")
```

- [ ] **Step 4: Extract remaining pages**

```python
# dashboard/pages/neighborhood.py
"""Neighborhood comparison page."""
import streamlit as st
from ..utils.session_manager import AppState

def render():
    """Render neighborhood analysis page."""
    st.title("Neighborhood Analysis")
    df = AppState.get_active_df()
    
    neighborhoods = sorted(df["neighbourhood_cleansed"].unique())
    selected = st.selectbox("Select Neighborhood", neighborhoods)
    
    subset = df[df["neighbourhood_cleansed"] == selected]
    
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Listings", len(subset))
        st.metric("Avg Price", f"${subset['price'].mean():.0f}")
    with col2:
        st.metric("Median Price", f"${subset['price'].median():.0f}")
        st.metric("Price Range", f"${subset['price'].min():.0f} - ${subset['price'].max():.0f}")
    
    st.info("Neighborhood page extracted — charts in Task 2.7")

# dashboard/pages/prediction.py
"""Price prediction page (Phase 4 will add real Bayesian)."""
import streamlit as st

def render():
    """Render price prediction page."""
    st.title("Price Prediction")
    st.info("Phase 4 will replace this with real Bayesian predictions from PyMC posterior")
    
    col1, col2 = st.columns(2)
    with col1:
        accommodates = st.slider("Accommodates", 1, 16, 2)
        bedrooms = st.slider("Bedrooms", 0, 10, 1)
    with col2:
        bathrooms = st.slider("Bathrooms", 0, 8, 1)
        beds = st.slider("Beds", 0, 16, 1)
    
    st.button("Predict Price (Coming in Phase 4)")

# dashboard/pages/market_intel.py
"""Market intelligence and trends."""
import streamlit as st
from ..utils.session_manager import AppState

def render():
    """Render market intelligence page."""
    st.title("Market Intelligence")
    df = AppState.get_active_df()
    
    st.subheader("Price Distribution by Room Type")
    room_types = df.groupby("room_type")["price"].agg(["mean", "median", "count"])
    st.dataframe(room_types)
    
    st.info("Market intel page extracted — charts in Task 2.7")

# dashboard/pages/business_strategy.py
"""Investment strategy and recommendations."""
import streamlit as st

def render():
    """Render business strategy page."""
    st.title("Business Strategy")
    st.info("Investment strategy page extracted from monolith")
    
    st.subheader("Key Insights")
    st.write("• High-demand neighborhoods show 2.6× price premium")
    st.write("• Entire home/apt listings outperform private rooms by 3.2×")
    st.write("• Properties with 2-3 bedrooms have highest occupancy rates")

# dashboard/pages/model_insights.py
"""Bayesian model insights (Phase 4 will add real posteriors)."""
import streamlit as st

def render():
    """Render model insights page."""
    st.title("Model Insights")
    st.info("Phase 4 will add real posterior distributions, convergence diagnostics, feature importance")
    
    st.subheader("Model Architecture")
    st.write("• Bayesian hierarchical model with neighborhood effects")
    st.write("• PyMC probabilistic programming")
    st.write("• MCMC sampling with NUTS")
```

- [ ] **Step 5: Run test to verify all pages exist**

```bash
pytest tests/test_pages.py -v
# Expected: 2 passed
```

- [ ] **Step 6: Commit pages extraction**

```bash
git add dashboard/pages/ tests/test_pages.py
git commit -m "feat: extract 6 pages from monolith

- overview.py with market KPIs
- neighborhood.py with comparison view
- prediction.py (placeholder for Phase 4 Bayesian)
- market_intel.py with trends
- business_strategy.py with insights
- model_insights.py (placeholder for Phase 4 posteriors)
- All pages export render() function

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.6: Build KPI Components

**Files:**
- Create: `dashboard/components/kpi_cards.py`
- Create: `tests/test_kpi_cards.py`
- Modify: `dashboard/pages/overview.py` (replace placeholder metrics)

- [ ] **Step 1: Write failing test for KPI cards**

```python
# tests/test_kpi_cards.py
import pandas as pd
import pytest

def test_render_market_kpis_with_default_data():
    """Test KPI cards render with Seattle data."""
    from dashboard.components.kpi_cards import render_market_kpis
    
    df = pd.DataFrame({
        "price": [100, 200, 300],
        "neighbourhood_cleansed": ["Capitol Hill", "Ballard", "Capitol Hill"],
        "availability_365": [100, 200, 300]
    })
    
    # Should not raise
    render_market_kpis(df)

def test_render_market_kpis_with_empty_df():
    """Test KPI cards handle empty dataframe."""
    from dashboard.components.kpi_cards import render_market_kpis
    
    df = pd.DataFrame(columns=["price", "neighbourhood_cleansed", "availability_365"])
    
    # Should not raise
    render_market_kpis(df)
```

- [ ] **Step 2: Run test expecting import error**

```bash
pytest tests/test_kpi_cards.py::test_render_market_kpis_with_default_data -v
# Expected: ImportError: cannot import name 'render_market_kpis'
```

- [ ] **Step 3: Implement KPI cards component**

```python
# dashboard/components/kpi_cards.py
"""Market KPI cards component."""
import streamlit as st
import pandas as pd

def render_market_kpis(df: pd.DataFrame):
    """Render 4-column KPI card grid.
    
    Args:
        df: Market data with price, neighbourhood_cleansed, availability_365 columns
    """
    if df.empty:
        st.warning("No data available for KPIs")
        return
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Listings", f"{len(df):,}")
    
    with col2:
        avg_price = df["price"].mean()
        st.metric("Avg Price", f"${avg_price:.0f}")
    
    with col3:
        neighborhoods = df["neighbourhood_cleansed"].nunique()
        st.metric("Neighborhoods", neighborhoods)
    
    with col4:
        occupancy = df["availability_365"].dropna().mean()
        if pd.isna(occupancy):
            occupancy = 0
        st.metric("Avg Availability", f"{occupancy:.0f} days")
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pytest tests/test_kpi_cards.py -v
# Expected: 2 passed
```

- [ ] **Step 5: Update overview page to use KPI component**

```python
# dashboard/pages/overview.py
"""Market overview page - KPIs, distributions, top neighborhoods."""
import streamlit as st
from ..utils.session_manager import AppState
from ..components.kpi_cards import render_market_kpis

def render():
    """Render market overview page."""
    st.title("Seattle Airbnb Market Overview")
    
    df = AppState.get_active_df()
    
    # Use component instead of inline metrics
    render_market_kpis(df)
    
    st.info("Overview page with KPI component — charts in Task 2.7")
```

- [ ] **Step 6: Commit KPI component**

```bash
git add dashboard/components/kpi_cards.py tests/test_kpi_cards.py dashboard/pages/overview.py
git commit -m "feat: add KPI cards component

- render_market_kpis() displays 4-column grid
- Handles empty dataframe gracefully
- Integrates into overview page
- Replaces inline metrics

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.7: Build Chart Components

**Files:**
- Create: `dashboard/components/charts.py`
- Create: `tests/test_charts.py`
- Modify: `dashboard/pages/overview.py` (add charts)
- Modify: `dashboard/pages/neighborhood.py` (add charts)

- [ ] **Step 1: Write failing test for charts**

```python
# tests/test_charts.py
import pandas as pd
import plotly.graph_objects as go

def test_price_distribution_chart():
    """Test price distribution returns Plotly figure."""
    from dashboard.components.charts import price_distribution
    
    df = pd.DataFrame({"price": [100, 200, 300, 400]})
    
    fig = price_distribution(df, theme_name="modern_neutral")
    
    assert isinstance(fig, go.Figure)
    assert len(fig.data) > 0

def test_top_neighborhoods_chart():
    """Test top neighborhoods bar chart."""
    from dashboard.components.charts import top_neighborhoods
    
    df = pd.DataFrame({
        "neighbourhood_cleansed": ["Capitol Hill", "Ballard", "Capitol Hill", "Fremont"],
        "price": [100, 200, 150, 80]
    })
    
    fig = top_neighborhoods(df, top_n=3, theme_name="modern_neutral")
    
    assert isinstance(fig, go.Figure)
    assert len(fig.data) > 0
```

- [ ] **Step 2: Run test expecting import error**

```bash
pytest tests/test_charts.py::test_price_distribution_chart -v
# Expected: ImportError: cannot import name 'price_distribution'
```

- [ ] **Step 3: Implement chart components**

```python
# dashboard/components/charts.py
"""Plotly chart components with theme awareness."""
import pandas as pd
import plotly.graph_objects as go
from ..utils.styling import get_chart_template, get_chart_palette

def price_distribution(df: pd.DataFrame, theme_name: str = "modern_neutral") -> go.Figure:
    """Create price distribution histogram.
    
    Args:
        df: Market data with price column
        theme_name: Theme name from themes.yaml
        
    Returns:
        Plotly figure
    """
    template = get_chart_template(theme_name)
    palette = get_chart_palette(theme_name)
    
    fig = go.Figure()
    fig.add_trace(go.Histogram(
        x=df["price"],
        nbinsx=50,
        marker_color=palette[0],
        name="Price Distribution"
    ))
    
    fig.update_layout(
        title="Price Distribution",
        xaxis_title="Price ($)",
        yaxis_title="Count",
        template=template,
        showlegend=False
    )
    
    return fig

def top_neighborhoods(df: pd.DataFrame, top_n: int = 10, theme_name: str = "modern_neutral") -> go.Figure:
    """Create top neighborhoods bar chart by average price.
    
    Args:
        df: Market data with neighbourhood_cleansed and price columns
        top_n: Number of top neighborhoods to show
        theme_name: Theme name from themes.yaml
        
    Returns:
        Plotly figure
    """
    template = get_chart_template(theme_name)
    palette = get_chart_palette(theme_name)
    
    neighborhood_prices = df.groupby("neighbourhood_cleansed")["price"].mean().sort_values(ascending=False).head(top_n)
    
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=neighborhood_prices.values,
        y=neighborhood_prices.index,
        orientation="h",
        marker_color=palette[1],
        name="Avg Price"
    ))
    
    fig.update_layout(
        title=f"Top {top_n} Neighborhoods by Avg Price",
        xaxis_title="Average Price ($)",
        yaxis_title="Neighborhood",
        template=template,
        showlegend=False
    )
    
    return fig

def room_type_comparison(df: pd.DataFrame, theme_name: str = "modern_neutral") -> go.Figure:
    """Create room type comparison bar chart.
    
    Args:
        df: Market data with room_type and price columns
        theme_name: Theme name from themes.yaml
        
    Returns:
        Plotly figure
    """
    template = get_chart_template(theme_name)
    palette = get_chart_palette(theme_name)
    
    room_stats = df.groupby("room_type")["price"].agg(["mean", "count"]).sort_values("mean", ascending=False)
    
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=room_stats.index,
        y=room_stats["mean"],
        text=room_stats["count"],
        texttemplate="n=%{text}",
        marker_color=palette[2],
        name="Avg Price"
    ))
    
    fig.update_layout(
        title="Average Price by Room Type",
        xaxis_title="Room Type",
        yaxis_title="Average Price ($)",
        template=template,
        showlegend=False
    )
    
    return fig
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pytest tests/test_charts.py -v
# Expected: 2 passed
```

- [ ] **Step 5: Integrate charts into pages**

```python
# dashboard/pages/overview.py
"""Market overview page - KPIs, distributions, top neighborhoods."""
import streamlit as st
from ..utils.session_manager import AppState
from ..components.kpi_cards import render_market_kpis
from ..components.charts import price_distribution, top_neighborhoods, room_type_comparison

def render():
    """Render market overview page."""
    st.title("Seattle Airbnb Market Overview")
    
    df = AppState.get_active_df()
    theme = st.session_state.get(AppState.THEME, "modern_neutral")
    
    render_market_kpis(df)
    
    st.subheader("Price Distribution")
    fig = price_distribution(df, theme_name=theme)
    st.plotly_chart(fig, use_container_width=True)
    
    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Top Neighborhoods")
        fig = top_neighborhoods(df, top_n=10, theme_name=theme)
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("Room Type Comparison")
        fig = room_type_comparison(df, theme_name=theme)
        st.plotly_chart(fig, use_container_width=True)

# dashboard/pages/neighborhood.py
"""Neighborhood comparison page."""
import streamlit as st
from ..utils.session_manager import AppState
from ..components.charts import price_distribution

def render():
    """Render neighborhood analysis page."""
    st.title("Neighborhood Analysis")
    df = AppState.get_active_df()
    theme = st.session_state.get(AppState.THEME, "modern_neutral")
    
    neighborhoods = sorted(df["neighbourhood_cleansed"].unique())
    selected = st.selectbox("Select Neighborhood", neighborhoods)
    
    subset = df[df["neighbourhood_cleansed"] == selected]
    
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Listings", len(subset))
        st.metric("Avg Price", f"${subset['price'].mean():.0f}")
    with col2:
        st.metric("Median Price", f"${subset['price'].median():.0f}")
        st.metric("Price Range", f"${subset['price'].min():.0f} - ${subset['price'].max():.0f}")
    
    st.subheader(f"Price Distribution - {selected}")
    fig = price_distribution(subset, theme_name=theme)
    st.plotly_chart(fig, use_container_width=True)
```

- [ ] **Step 6: Commit chart components**

```bash
git add dashboard/components/charts.py tests/test_charts.py dashboard/pages/overview.py dashboard/pages/neighborhood.py
git commit -m "feat: add theme-aware chart components

- price_distribution() histogram
- top_neighborhoods() horizontal bar
- room_type_comparison() bar chart
- All charts use theme palette and template
- Integrated into overview and neighborhood pages

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.8: Build New App Router

**Files:**
- Modify: `app.py` (root file, replace monolith with router)
- Modify: `dashboard/utils/session_manager.py` (add default data loader)

- [ ] **Step 1: Write test for router structure**

```python
# tests/test_app_router.py
def test_app_has_page_registry():
    """Test app.py defines PAGE_REGISTRY."""
    import sys
    import importlib.util
    
    spec = importlib.util.spec_from_file_location("app", "app.py")
    app_module = importlib.util.module_from_spec(spec)
    
    assert hasattr(app_module, "PAGE_REGISTRY")
    assert isinstance(app_module.PAGE_REGISTRY, dict)
    assert len(app_module.PAGE_REGISTRY) >= 6
```

- [ ] **Step 2: Add default data loader to session manager**

```python
# dashboard/utils/session_manager.py
"""Session state management with type-safe keys."""
import streamlit as st
import pandas as pd
from dataclasses import dataclass
from pathlib import Path

@dataclass
class AppState:
    """Type-safe session state keys."""
    DATA_SOURCE: str = "data_source"
    UPLOADED_DF: str = "uploaded_df"
    THEME: str = "theme"
    
    @staticmethod
    def init():
        """Initialize session state with defaults."""
        if "default_df" not in st.session_state:
            st.session_state["default_df"] = load_default_data()
        
        if AppState.DATA_SOURCE not in st.session_state:
            st.session_state[AppState.DATA_SOURCE] = "default"
        
        if AppState.THEME not in st.session_state:
            st.session_state[AppState.THEME] = "modern_neutral"
    
    @staticmethod
    def get_active_df() -> pd.DataFrame:
        """Get currently active dataframe (uploaded or default)."""
        if st.session_state.get(AppState.DATA_SOURCE) == "uploaded":
            uploaded = st.session_state.get(AppState.UPLOADED_DF)
            if uploaded is not None:
                return uploaded
            # Fallback to default if uploaded is None
            st.session_state[AppState.DATA_SOURCE] = "default"
        
        return st.session_state["default_df"]
    
    @staticmethod
    def reset_to_default():
        """Reset to default Seattle dataset."""
        st.session_state[AppState.DATA_SOURCE] = "default"
        if AppState.UPLOADED_DF in st.session_state:
            del st.session_state[AppState.UPLOADED_DF]

def load_default_data() -> pd.DataFrame:
    """Load default Seattle Airbnb dataset.
    
    Returns:
        Seattle listing data with required columns
    """
    data_path = Path(__file__).parent.parent.parent / "data" / "seattle_listings.csv"
    
    if not data_path.exists():
        # Fallback: generate minimal synthetic data for development
        return pd.DataFrame({
            "price": [100, 150, 200] * 100,
            "neighbourhood_cleansed": ["Capitol Hill", "Ballard", "Fremont"] * 100,
            "room_type": ["Entire home/apt", "Private room", "Shared room"] * 100,
            "accommodates": [2, 4, 1] * 100,
            "bedrooms": [1, 2, 0] * 100,
            "bathrooms": [1, 1.5, 1] * 100,
            "beds": [1, 2, 1] * 100,
            "availability_365": [100, 200, 50] * 100,
            "review_scores_rating": [4.5, 4.8, 4.2] * 100
        })
    
    return pd.read_csv(data_path)
```

- [ ] **Step 3: Implement new app.py router**

```python
# app.py
"""Bayesian Dashboard for Recruiters - Universal Airbnb Analytics Platform.

HuggingFace Spaces entry point with page routing and theme management.
"""
import streamlit as st
from dashboard.utils.session_manager import AppState
from dashboard.utils.styling import apply_theme
from dashboard.pages import (
    overview,
    neighborhood,
    prediction,
    market_intel,
    business_strategy,
    model_insights
)

# Page configuration
st.set_page_config(
    page_title="Bayesian Dashboard for Recruiters",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Page registry
PAGE_REGISTRY = {
    "Market Overview": overview.render,
    "Neighborhood Analysis": neighborhood.render,
    "Price Prediction": prediction.render,
    "Market Intelligence": market_intel.render,
    "Business Strategy": business_strategy.render,
    "Model Insights": model_insights.render
}

def main():
    """Main application entry point."""
    # Initialize session state
    AppState.init()
    
    # Sidebar navigation
    st.sidebar.title("Navigation")
    page = st.sidebar.radio("Select Page", list(PAGE_REGISTRY.keys()))
    
    # Theme toggle
    st.sidebar.markdown("---")
    st.sidebar.subheader("Theme")
    
    current_theme = st.session_state[AppState.THEME]
    theme_choice = st.sidebar.radio(
        "Select Theme",
        ["modern_neutral", "deep_forest"],
        index=0 if current_theme == "modern_neutral" else 1,
        format_func=lambda x: "Light Mode" if x == "modern_neutral" else "Dark Mode"
    )
    
    # Detect theme change and trigger rerun
    if theme_choice != st.session_state[AppState.THEME]:
        st.session_state[AppState.THEME] = theme_choice
        st.rerun()
    
    # Apply current theme
    apply_theme(st.session_state[AppState.THEME])
    
    # Data source indicator
    st.sidebar.markdown("---")
    st.sidebar.subheader("Data Source")
    data_source = st.session_state[AppState.DATA_SOURCE]
    if data_source == "uploaded":
        st.sidebar.info("Using uploaded CSV")
        if st.sidebar.button("Reset to Seattle Data"):
            AppState.reset_to_default()
            st.rerun()
    else:
        st.sidebar.info("Using default Seattle data")
    
    # Render selected page
    PAGE_REGISTRY[page]()
    
    # Footer
    st.sidebar.markdown("---")
    st.sidebar.caption("Bayesian Dashboard v2.0 | Universal Airbnb Analytics")

if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Test router locally**

```bash
streamlit run app.py
# Expected: Dashboard loads, can navigate between pages, theme toggle works
```

- [ ] **Step 5: Commit new router**

```bash
git add app.py dashboard/utils/session_manager.py tests/test_app_router.py
git commit -m "feat: replace monolith with modular router

- PAGE_REGISTRY maps pages to render functions
- Sidebar navigation with 6 pages
- Theme toggle with rerun on change
- Data source indicator
- load_default_data() with fallback synthetic data
- AppState.init() loads Seattle data once

Closes Phase 2 refactor (18h -> 37.5h with visual + theme + fixes)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: CSV Upload (12h)

**Goal:** Allow users to upload their own city data with smart schema detection and validation.

---

### Task 3.1: Schema Detector

**Files:**
- Create: `dashboard/config/column_aliases.yaml`
- Create: `dashboard/utils/schema_detector.py`
- Create: `tests/test_schema_detector.py`

- [ ] **Step 1: Write failing test for schema detection**

```python
# tests/test_schema_detector.py
import pandas as pd

def test_detect_mapping_exact_match():
    """Test schema detection with exact column names."""
    from dashboard.utils.schema_detector import detect_mapping
    
    df = pd.DataFrame({
        "price": [100, 200],
        "neighbourhood_cleansed": ["A", "B"],
        "room_type": ["Entire home/apt", "Private room"],
        "accommodates": [2, 4],
        "bedrooms": [1, 2],
        "bathrooms": [1, 1.5],
        "beds": [1, 2],
        "availability_365": [100, 200],
        "review_scores_rating": [4.5, 4.8]
    })
    
    renamed_df = detect_mapping(df)
    
    # Should keep standard names
    assert "price" in renamed_df.columns
    assert "neighbourhood_cleansed" in renamed_df.columns

def test_detect_mapping_fuzzy_match():
    """Test schema detection with fuzzy column names."""
    from dashboard.utils.schema_detector import detect_mapping
    
    df = pd.DataFrame({
        "Price per Night": [100, 200],
        "Neighborhood": ["A", "B"],
        "Room Type": ["Entire home/apt", "Private room"],
        "Max Guests": [2, 4],
        "Bedrooms": [1, 2],
        "Bathrooms": [1, 1.5],
        "Beds": [1, 2],
        "Available Days": [100, 200],
        "Rating": [4.5, 4.8]
    })
    
    renamed_df = detect_mapping(df)
    
    # Should rename to standard names
    assert "price" in renamed_df.columns
    assert "neighbourhood_cleansed" in renamed_df.columns
    assert "accommodates" in renamed_df.columns
```

- [ ] **Step 2: Run test expecting import error**

```bash
pytest tests/test_schema_detector.py::test_detect_mapping_exact_match -v
# Expected: ImportError: cannot import name 'detect_mapping'
```

- [ ] **Step 3: Create column aliases config**

```yaml
# dashboard/config/column_aliases.yaml
# Fuzzy matching aliases for schema detection
# Each standard column lists common variations seen in CSV uploads

price:
  - price
  - price_per_night
  - nightly_price
  - cost
  - rate
  - amount

neighbourhood_cleansed:
  - neighbourhood_cleansed
  - neighborhood
  - neighbourhood
  - area
  - district
  - location

room_type:
  - room_type
  - property_type
  - listing_type
  - type

accommodates:
  - accommodates
  - max_guests
  - capacity
  - guests
  - sleeps

bedrooms:
  - bedrooms
  - bedroom_count
  - num_bedrooms

bathrooms:
  - bathrooms
  - bathroom_count
  - num_bathrooms

beds:
  - beds
  - bed_count
  - num_beds

availability_365:
  - availability_365
  - available_days
  - availability
  - days_available

review_scores_rating:
  - review_scores_rating
  - rating
  - review_score
  - review_rating
  - score
```

- [ ] **Step 4: Implement schema detector**

```python
# dashboard/utils/schema_detector.py
"""Schema detection with fuzzy column matching."""
import pandas as pd
import yaml
from pathlib import Path
from difflib import SequenceMatcher

def load_column_aliases() -> dict[str, list[str]]:
    """Load column alias mappings from YAML.
    
    Returns:
        Dict mapping standard column names to list of aliases
    """
    config_path = Path(__file__).parent.parent / "config" / "column_aliases.yaml"
    with open(config_path) as f:
        return yaml.safe_load(f)

def fuzzy_match_column(user_col: str, standard_col: str, aliases: list[str], threshold: float = 0.7) -> float:
    """Calculate best fuzzy match score between user column and standard aliases.
    
    Args:
        user_col: User's column name
        standard_col: Standard column name
        aliases: List of known aliases for this column
        threshold: Minimum similarity ratio (0-1)
        
    Returns:
        Best match score (0-1), or 0 if below threshold
        
    Note:
        Uses difflib.SequenceMatcher which is O(n×m) per comparison.
        With ~10 aliases per column and ~50 user columns, this is acceptable.
        For 1000+ columns, consider alternative fuzzy matching algorithms.
    """
    user_col_clean = user_col.lower().replace("_", "").replace(" ", "")
    
    best_score = 0.0
    for alias in aliases:
        alias_clean = alias.lower().replace("_", "").replace(" ", "")
        score = SequenceMatcher(None, user_col_clean, alias_clean).ratio()
        if score > best_score:
            best_score = score
    
    return best_score if best_score >= threshold else 0.0

def detect_mapping(df: pd.DataFrame) -> pd.DataFrame:
    """Detect and rename columns to standard schema.
    
    Args:
        df: User-uploaded dataframe
        
    Returns:
        Dataframe with columns renamed to standard names
        
    Raises:
        ValueError: If required columns cannot be mapped
    """
    aliases = load_column_aliases()
    
    # Track which columns have been assigned to prevent duplicates
    assigned_cols = set()
    rename_dict = {}
    
    for standard_col, alias_list in aliases.items():
        # Check for exact match first
        if standard_col in df.columns and standard_col not in assigned_cols:
            assigned_cols.add(standard_col)
            continue
        
        # Fuzzy match
        best_match = None
        best_score = 0.0
        
        for user_col in df.columns:
            if user_col in assigned_cols:
                continue
            
            score = fuzzy_match_column(user_col, standard_col, alias_list)
            if score > best_score:
                best_score = score
                best_match = user_col
        
        if best_match:
            rename_dict[best_match] = standard_col
            assigned_cols.add(best_match)
    
    return df.rename(columns=rename_dict)
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pytest tests/test_schema_detector.py -v
# Expected: 2 passed
```

- [ ] **Step 6: Commit schema detector**

```bash
git add dashboard/config/column_aliases.yaml dashboard/utils/schema_detector.py tests/test_schema_detector.py
git commit -m "feat: add fuzzy schema detection for CSV uploads

- column_aliases.yaml with 9 standard columns
- detect_mapping() uses SequenceMatcher (70% threshold)
- Handles exact matches and fuzzy variations
- Prevents duplicate column assignments

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3.2: Data Validators

**Files:**
- Create: `dashboard/utils/validators.py`
- Create: `tests/test_validators.py`
- Modify: `dashboard/config/column_aliases.yaml` (add validation rules)

- [ ] **Step 1: Write failing test for validators**

```python
# tests/test_validators.py
import pandas as pd
import pytest

def test_validate_schema_success():
    """Test schema validation with all required columns."""
    from dashboard.utils.validators import validate_schema
    
    df = pd.DataFrame({
        "price": [100, 200],
        "neighbourhood_cleansed": ["A", "B"],
        "room_type": ["Entire home/apt", "Private room"],
        "accommodates": [2, 4],
        "bedrooms": [1, 2],
        "bathrooms": [1, 1.5],
        "beds": [1, 2],
        "availability_365": [100, 200],
        "review_scores_rating": [4.5, 4.8]
    })
    
    # Should not raise
    warnings = validate_schema(df)
    assert isinstance(warnings, list)

def test_validate_schema_missing_column():
    """Test schema validation with missing required column."""
    from dashboard.utils.validators import validate_schema
    from dashboard.utils.exceptions import ColumnMappingError
    
    df = pd.DataFrame({
        "price": [100, 200],
        "neighbourhood_cleansed": ["A", "B"]
    })
    
    with pytest.raises(ColumnMappingError) as exc_info:
        validate_schema(df)
    
    assert "room_type" in str(exc_info.value)

def test_validate_data_quality():
    """Test data quality checks."""
    from dashboard.utils.validators import validate_data_quality
    
    df = pd.DataFrame({
        "price": [100, -50, 999999],  # Negative and extreme value
        "accommodates": [2, 0, 4],    # Zero value
        "bedrooms": [1, None, 2]       # Missing value
    })
    
    warnings = validate_data_quality(df)
    
    assert len(warnings) > 0
    assert any("negative" in w.lower() for w in warnings)
```

- [ ] **Step 2: Run test expecting import error**

```bash
pytest tests/test_validators.py::test_validate_schema_success -v
# Expected: ImportError: cannot import name 'validate_schema'
```

- [ ] **Step 3: Add validation rules to YAML**

```yaml
# dashboard/config/column_aliases.yaml (append to existing file)

validation_rules:
  required_columns:
    - price
    - neighbourhood_cleansed
    - room_type
    - accommodates
  
  optional_columns:
    - bedrooms
    - bathrooms
    - beds
    - availability_365
    - review_scores_rating
  
  numeric_columns:
    - price
    - accommodates
    - bedrooms
    - bathrooms
    - beds
    - availability_365
    - review_scores_rating
  
  integer_columns:
    - accommodates
    - bedrooms
    - beds
    - availability_365
  
  categorical_columns:
    - neighbourhood_cleansed
    - room_type
  
  bounds:
    price:
      min: 0
      max: null  # No upper limit (NYC/SF can exceed $1000)
    accommodates:
      min: 1
      max: 16
    bedrooms:
      min: 0
      max: 10
    bathrooms:
      min: 0
      max: 8
    beds:
      min: 0
      max: 16
    availability_365:
      min: 0
      max: 365
    review_scores_rating:
      min: 0
      max: 5
```

- [ ] **Step 4: Implement validators**

```python
# dashboard/utils/validators.py
"""Data validation for uploaded CSVs."""
import pandas as pd
import yaml
from pathlib import Path
from .exceptions import ColumnMappingError, InsufficientDataError, ValidationError

def load_validation_rules() -> dict:
    """Load validation rules from YAML.
    
    Returns:
        Dict with required_columns, bounds, etc.
    """
    config_path = Path(__file__).parent.parent / "config" / "column_aliases.yaml"
    with open(config_path) as f:
        config = yaml.safe_load(f)
        return config["validation_rules"]

def validate_schema(df: pd.DataFrame) -> list[str]:
    """Validate dataframe has required columns.
    
    Args:
        df: Dataframe with standard column names (after schema detection)
        
    Returns:
        List of warnings for missing optional columns
        
    Raises:
        ColumnMappingError: If required columns are missing
    """
    rules = load_validation_rules()
    required = set(rules["required_columns"])
    optional = set(rules.get("optional_columns", []))
    
    present = set(df.columns)
    missing_required = required - present
    
    if missing_required:
        raise ColumnMappingError(list(missing_required))
    
    missing_optional = optional - present
    warnings = []
    if missing_optional:
        warnings.append(f"Missing optional columns: {', '.join(missing_optional)}")
    
    return warnings

def validate_data_quality(df: pd.DataFrame) -> list[str]:
    """Validate data quality (types, bounds, missing values).
    
    Args:
        df: Dataframe with standard column names
        
    Returns:
        List of warnings for quality issues
        
    Raises:
        InsufficientDataError: If dataframe has too few rows
        ValidationError: If critical quality issues found
    """
    rules = load_validation_rules()
    warnings = []
    
    # Minimum row count
    min_rows = 10
    if len(df) < min_rows:
        raise InsufficientDataError(len(df), min_rows)
    
    # Type validation
    numeric_cols = rules.get("numeric_columns", [])
    integer_cols = rules.get("integer_columns", [])
    
    for col in numeric_cols:
        if col not in df.columns:
            continue
        
        if not pd.api.types.is_numeric_dtype(df[col]):
            raise ValidationError(f"Column '{col}' must be numeric, got {df[col].dtype}")
    
    for col in integer_cols:
        if col not in df.columns:
            continue
        
        # Check if values are integer-like (allow NaN)
        non_null = df[col].dropna()
        if len(non_null) > 0 and not all(non_null == non_null.astype(int)):
            warnings.append(f"Column '{col}' expected integers, found decimal values")
    
    # Bounds validation
    bounds = rules.get("bounds", {})
    for col, limits in bounds.items():
        if col not in df.columns:
            continue
        
        non_null = df[col].dropna()
        if len(non_null) == 0:
            continue
        
        min_val = limits.get("min")
        max_val = limits.get("max")
        
        if min_val is not None:
            below_min = (non_null < min_val).sum()
            if below_min > 0:
                warnings.append(f"{col}: {below_min} values below minimum ({min_val})")
        
        if max_val is not None:
            above_max = (non_null > max_val).sum()
            if above_max > 0:
                warnings.append(f"{col}: {above_max} values above maximum ({max_val})")
    
    # Missing value check
    for col in df.columns:
        missing_pct = df[col].isna().mean() * 100
        if missing_pct > 50:
            warnings.append(f"{col}: {missing_pct:.0f}% missing values")
    
    return warnings
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pytest tests/test_validators.py -v
# Expected: 3 passed
```

- [ ] **Step 6: Commit validators**

```bash
git add dashboard/utils/validators.py tests/test_validators.py dashboard/config/column_aliases.yaml
git commit -m "feat: add data validation for uploaded CSVs

- validate_schema() checks required/optional columns
- validate_data_quality() checks types, bounds, missing values
- validation_rules in YAML with configurable bounds
- Raises ColumnMappingError, InsufficientDataError, ValidationError

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3.3: CSV Upload Handler

**Files:**
- Create: `dashboard/utils/csv_handler.py`
- Create: `tests/test_csv_handler.py`

- [ ] **Step 1: Write failing test for CSV handler**

```python
# tests/test_csv_handler.py
import pandas as pd
from io import StringIO

def test_process_upload_success():
    """Test successful CSV processing."""
    from dashboard.utils.csv_handler import process_upload
    
    csv_content = """Price,Neighborhood,Room Type,Max Guests,Bedrooms,Bathrooms,Beds,Available Days,Rating
100,Capitol Hill,Entire home/apt,2,1,1,1,100,4.5
200,Ballard,Private room,4,2,1.5,2,200,4.8
"""
    
    file = StringIO(csv_content)
    
    result = process_upload(file, "test.csv")
    
    assert result["success"] is True
    assert isinstance(result["df"], pd.DataFrame)
    assert "price" in result["df"].columns
    assert len(result["warnings"]) >= 0

def test_process_upload_missing_columns():
    """Test CSV processing with missing required columns."""
    from dashboard.utils.csv_handler import process_upload
    
    csv_content = """Price,Neighborhood
100,Capitol Hill
200,Ballard
"""
    
    file = StringIO(csv_content)
    
    result = process_upload(file, "test.csv")
    
    assert result["success"] is False
    assert "error" in result
    assert "room_type" in result["error"].lower()
```

- [ ] **Step 2: Run test expecting import error**

```bash
pytest tests/test_csv_handler.py::test_process_upload_success -v
# Expected: ImportError: cannot import name 'process_upload'
```

- [ ] **Step 3: Implement CSV handler**

```python
# dashboard/utils/csv_handler.py
"""CSV upload processing pipeline."""
import pandas as pd
from typing import BinaryIO, TextIO
from .schema_detector import detect_mapping
from .validators import validate_schema, validate_data_quality
from .exceptions import ColumnMappingError, InsufficientDataError, ValidationError

MAX_FILE_SIZE_MB = 100

def process_upload(file: BinaryIO | TextIO, filename: str) -> dict:
    """Process uploaded CSV file through validation pipeline.
    
    Args:
        file: Uploaded file object (from st.file_uploader)
        filename: Original filename
        
    Returns:
        Dict with:
        - success: bool
        - df: pd.DataFrame (if success)
        - warnings: list[str] (if success)
        - error: str (if failure)
        - error_type: str (if failure) - "schema", "quality", "size", "format"
    """
    try:
        # Check file size
        file.seek(0, 2)  # Seek to end
        size_bytes = file.tell()
        file.seek(0)  # Reset to start
        
        max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024
        if size_bytes > max_bytes:
            return {
                "success": False,
                "error": f"File too large ({size_bytes / 1024 / 1024:.1f}MB). Maximum is {MAX_FILE_SIZE_MB}MB.",
                "error_type": "size"
            }
        
        # Read CSV
        df = pd.read_csv(file)
        
        # Schema detection
        df = detect_mapping(df)
        
        # Schema validation
        schema_warnings = validate_schema(df)
        
        # Data quality validation
        quality_warnings = validate_data_quality(df)
        
        warnings = schema_warnings + quality_warnings
        
        return {
            "success": True,
            "df": df,
            "warnings": warnings
        }
    
    except ColumnMappingError as e:
        return {
            "success": False,
            "error": f"Missing required columns: {', '.join(e.missing_columns)}",
            "error_type": "schema"
        }
    
    except InsufficientDataError as e:
        return {
            "success": False,
            "error": f"Not enough data: {e.actual_rows} rows (need at least {e.required_rows})",
            "error_type": "quality"
        }
    
    except ValidationError as e:
        return {
            "success": False,
            "error": str(e),
            "error_type": "quality"
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to parse CSV: {str(e)}",
            "error_type": "format"
        }
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pytest tests/test_csv_handler.py -v
# Expected: 2 passed
```

- [ ] **Step 5: Commit CSV handler**

```bash
git add dashboard/utils/csv_handler.py tests/test_csv_handler.py
git commit -m "feat: add CSV upload processing pipeline

- process_upload() orchestrates schema detection + validation
- Returns success/failure with structured error types
- 100MB file size limit enforced before processing
- Returns warnings for optional columns and quality issues

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3.4: Upload Page UI

**Files:**
- Create: `dashboard/pages/upload.py`
- Modify: `app.py` (add upload page to registry)

- [ ] **Step 1: Create upload page skeleton**

```python
# dashboard/pages/upload.py
"""CSV upload page with smart progressive disclosure UX."""
import streamlit as st
from ..utils.session_manager import AppState
from ..utils.csv_handler import process_upload
from ..config.settings import IS_PRODUCTION

def render():
    """Render CSV upload page."""
    st.title("Upload Your City Data")
    
    st.markdown("""
    Upload a CSV file with Airbnb listing data from any city.
    
    **Required columns:** price, neighborhood, room type, accommodates  
    **Optional columns:** bedrooms, bathrooms, beds, availability, rating
    
    The system will auto-detect column names (e.g., "Price per Night" → `price`)
    """)
    
    # TODO: Add file uploader in next step
    st.info("Upload UI coming in next step")
```

- [ ] **Step 2: Add upload page to router**

```python
# app.py (modify PAGE_REGISTRY)
from dashboard.pages import (
    overview,
    neighborhood,
    prediction,
    market_intel,
    business_strategy,
    model_insights,
    upload  # Add this import
)

# Update PAGE_REGISTRY
PAGE_REGISTRY = {
    "Market Overview": overview.render,
    "Neighborhood Analysis": neighborhood.render,
    "Price Prediction": prediction.render,
    "Market Intelligence": market_intel.render,
    "Business Strategy": business_strategy.render,
    "Model Insights": model_insights.render,
    "Upload Data": upload.render  # Add this entry
}
```

- [ ] **Step 3: Implement smart progressive disclosure UX**

```python
# dashboard/pages/upload.py
"""CSV upload page with smart progressive disclosure UX."""
import streamlit as st
from ..utils.session_manager import AppState
from ..utils.csv_handler import process_upload

def render():
    """Render CSV upload page."""
    st.title("Upload Your City Data")
    
    st.markdown("""
    Upload a CSV file with Airbnb listing data from any city.
    
    **Required columns:** price, neighborhood, room type, accommodates  
    **Optional columns:** bedrooms, bathrooms, beds, availability, rating
    
    The system will auto-detect column names (e.g., "Price per Night" → `price`)
    """)
    
    # Success message from previous upload (stored before rerun)
    if "_upload_success" in st.session_state:
        st.success(st.session_state["_upload_success"])
        del st.session_state["_upload_success"]
    
    uploaded_file = st.file_uploader(
        "Choose a CSV file",
        type=["csv"],
        help="Maximum file size: 100MB"
    )
    
    if uploaded_file is not None:
        with st.spinner("Processing your data..."):
            result = process_upload(uploaded_file, uploaded_file.name)
        
        if result["success"]:
            df = result["df"]
            warnings = result["warnings"]
            
            # Clean upload: minimal feedback
            if not warnings:
                st.session_state[AppState.UPLOADED_DF] = df
                st.session_state[AppState.DATA_SOURCE] = "uploaded"
                st.session_state["_upload_success"] = f"✓ Uploaded {len(df):,} listings from {df['neighbourhood_cleansed'].nunique()} neighborhoods"
                st.rerun()
            
            # Warnings present: expand details automatically
            else:
                with st.expander("⚠ Data Quality Warnings", expanded=True):
                    for warning in warnings:
                        st.warning(warning)
                
                st.subheader("Preview")
                st.dataframe(df.head(10))
                
                st.subheader("Detected Columns")
                col_info = []
                for col in df.columns:
                    dtype = str(df[col].dtype)
                    missing = df[col].isna().sum()
                    col_info.append({"Column": col, "Type": dtype, "Missing": missing})
                st.table(col_info)
                
                if st.button("Use This Data Anyway"):
                    st.session_state[AppState.UPLOADED_DF] = df
                    st.session_state[AppState.DATA_SOURCE] = "uploaded"
                    st.session_state["_upload_success"] = f"✓ Uploaded {len(df):,} listings (with warnings)"
                    st.rerun()
        
        else:
            # Error: show details immediately
            error_type = result["error_type"]
            error_msg = result["error"]
            
            if error_type == "schema":
                st.error(f"Schema Error: {error_msg}")
                st.info("Make sure your CSV includes columns for: price, neighborhood, room type, and accommodates")
            
            elif error_type == "quality":
                st.error(f"Data Quality Issue: {error_msg}")
            
            elif error_type == "size":
                st.error(error_msg)
            
            else:
                st.error(f"Upload Failed: {error_msg}")
    
    # Show current dataset info
    if st.session_state[AppState.DATA_SOURCE] == "uploaded":
        st.markdown("---")
        st.subheader("Currently Loaded Data")
        
        df = st.session_state[AppState.UPLOADED_DF]
        st.info(f"{len(df):,} listings from {df['neighbourhood_cleansed'].nunique()} neighborhoods")
        
        if st.button("Clear Uploaded Data"):
            AppState.reset_to_default()
            st.rerun()
```

- [ ] **Step 4: Test upload flow locally**

```bash
# Create test CSV
echo "Price,Neighborhood,Room Type,Max Guests,Bedrooms,Bathrooms,Beds,Available Days,Rating
100,Capitol Hill,Entire home/apt,2,1,1,1,100,4.5
200,Ballard,Private room,4,2,1.5,2,200,4.8" > /tmp/test_upload.csv

streamlit run app.py
# Navigate to "Upload Data" page
# Upload /tmp/test_upload.csv
# Expected: Success message, data switches to uploaded
```

- [ ] **Step 5: Commit upload page**

```bash
git add dashboard/pages/upload.py app.py
git commit -m "feat: add CSV upload page with smart progressive UX

- Smart progressive disclosure: clean uploads get minimal feedback
- Warnings expand automatically with preview + column info
- Errors show immediately with helpful guidance
- Success message persists across rerun
- 'Use Anyway' button for uploads with warnings
- 'Clear Uploaded Data' to reset to Seattle

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 4: Real Bayesian Predictions (6h)

**Goal:** Replace fake predictions with real PyMC posterior sampling.

---

### Task 4.1: Model Loader

**Files:**
- Create: `dashboard/utils/model_loader.py`
- Create: `tests/test_model_loader.py`
- Create: `models/scaler_params.json` (placeholder)

- [ ] **Step 1: Write failing test for model loader**

```python
# tests/test_model_loader.py
def test_load_trained_model():
    """Test loading PyMC model from InferenceData."""
    from dashboard.utils.model_loader import load_trained_model
    
    # Should return InferenceData or None if file doesn't exist
    idata = load_trained_model()
    
    # In test environment, file may not exist
    assert idata is None or hasattr(idata, "posterior")

def test_load_scaler_params():
    """Test loading scaler parameters."""
    from dashboard.utils.model_loader import load_scaler_params
    
    params = load_scaler_params()
    
    assert isinstance(params, dict)
    # Should have training data statistics
    assert "accommodates_mean" in params
    assert "accommodates_std" in params
```

- [ ] **Step 2: Run test expecting import error**

```bash
pytest tests/test_model_loader.py::test_load_trained_model -v
# Expected: ImportError: cannot import name 'load_trained_model'
```

- [ ] **Step 3: Create scaler params placeholder**

```json
{
  "accommodates_mean": 3.2,
  "accommodates_std": 2.1,
  "description": "Training data statistics for feature standardization. Replace with actual values from model training script."
}
```

- [ ] **Step 4: Implement model loader**

```python
# dashboard/utils/model_loader.py
"""Model loading with caching for PyMC InferenceData."""
import streamlit as st
import arviz as az
import json
from pathlib import Path
from typing import Optional

@st.cache_resource
def load_trained_model() -> Optional[az.InferenceData]:
    """Load trained PyMC model (InferenceData with posterior samples).
    
    Returns:
        InferenceData if model file exists, None otherwise
        
    Note:
        Cached with @st.cache_resource to load once per session.
        Model file should be generated by training script (Phase 4 final task).
    """
    model_path = Path(__file__).parent.parent.parent / "models" / "trained_model.nc"
    
    if not model_path.exists():
        return None
    
    try:
        return az.from_netcdf(model_path)
    except Exception as e:
        st.error(f"Failed to load model: {e}")
        return None

def load_scaler_params() -> dict:
    """Load feature scaler parameters from training data.
    
    Returns:
        Dict with mean/std for each feature used in standardization
        
    Note:
        These come from the training dataset, NOT from user uploads.
        Used to standardize prediction inputs to match training scale.
    """
    params_path = Path(__file__).parent.parent.parent / "models" / "scaler_params.json"
    
    if not params_path.exists():
        # Fallback to placeholder values
        return {
            "accommodates_mean": 3.2,
            "accommodates_std": 2.1
        }
    
    with open(params_path) as f:
        return json.load(f)
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pytest tests/test_model_loader.py -v
# Expected: 2 passed
```

- [ ] **Step 6: Commit model loader**

```bash
git add dashboard/utils/model_loader.py tests/test_model_loader.py models/scaler_params.json
git commit -m "feat: add PyMC model loader with caching

- load_trained_model() returns InferenceData from models/trained_model.nc
- load_scaler_params() loads training data statistics
- @st.cache_resource ensures single load per session
- Graceful fallback if model files missing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4.2: Bayesian Predictor

**Files:**
- Create: `dashboard/utils/bayesian_predictor.py`
- Create: `tests/test_bayesian_predictor.py`

- [ ] **Step 1: Write failing test for predictor**

```python
# tests/test_bayesian_predictor.py
import numpy as np

def test_predict_price_with_mock_posterior():
    """Test price prediction with mock posterior samples."""
    from dashboard.utils.bayesian_predictor import predict_price
    
    # Mock inputs
    inputs = {
        "accommodates": 2,
        "bedrooms": 1,
        "bathrooms": 1,
        "beds": 1
    }
    
    # Mock posterior samples (500 draws)
    mock_posterior = {
        "intercept": np.random.normal(5, 0.1, 500),
        "beta_accommodates": np.random.normal(0.3, 0.05, 500)
    }
    
    result = predict_price(inputs, mock_posterior, scaler_params={"accommodates_mean": 3, "accommodates_std": 2})
    
    assert "median" in result
    assert "ci_lower" in result
    assert "ci_upper" in result
    assert "samples" in result
    assert len(result["samples"]) == 500
```

- [ ] **Step 2: Run test expecting import error**

```bash
pytest tests/test_bayesian_predictor.py::test_predict_price_with_mock_posterior -v
# Expected: ImportError: cannot import name 'predict_price'
```

- [ ] **Step 3: Implement Bayesian predictor**

```python
# dashboard/utils/bayesian_predictor.py
"""Real Bayesian predictions from PyMC posterior samples."""
import numpy as np
import arviz as az
from typing import Optional

def standardize_feature(value: float, mean: float, std: float) -> float:
    """Standardize feature to match training scale.
    
    Args:
        value: Raw feature value
        mean: Training data mean
        std: Training data std
        
    Returns:
        Standardized value
    """
    return (value - mean) / std

def predict_price(
    inputs: dict,
    posterior_samples: dict,
    scaler_params: dict,
    n_samples: int = 500
) -> dict:
    """Generate price predictions from PyMC posterior samples.
    
    Args:
        inputs: Dict with accommodates, bedrooms, bathrooms, beds
        posterior_samples: Dict of posterior arrays (intercept, beta_*, etc.)
        scaler_params: Dict with *_mean and *_std from training data
        n_samples: Number of posterior samples to use
        
    Returns:
        Dict with median, ci_lower, ci_upper, samples
        
    Note:
        Uses real MCMC posterior samples, not np.random.normal.
        Posterior already includes uncertainty — no manual noise added.
    """
    # Standardize inputs using TRAINING data stats (not current data)
    accommodates_std = standardize_feature(
        inputs["accommodates"],
        scaler_params["accommodates_mean"],
        scaler_params["accommodates_std"]
    )
    
    # Generate predictions from posterior samples
    # Each sample represents one plausible parameter setting
    intercept = posterior_samples["intercept"][:n_samples]
    beta_accommodates = posterior_samples["beta_accommodates"][:n_samples]
    
    # Log-scale predictions
    log_price_samples = intercept + beta_accommodates * accommodates_std
    
    # TODO(Phase 5): Add bedroom, bathroom, room_type effects
    # log_price_samples += beta_bedrooms * bedrooms_std
    # log_price_samples += beta_bathrooms * bathrooms_std
    
    # Exponentiate to get prices (model predicts log(price))
    price_samples = np.exp(log_price_samples)
    
    # Compute credible interval
    median = np.median(price_samples)
    ci_lower = np.percentile(price_samples, 2.5)
    ci_upper = np.percentile(price_samples, 97.5)
    
    return {
        "median": median,
        "ci_lower": ci_lower,
        "ci_upper": ci_upper,
        "samples": price_samples
    }

def predict_from_idata(
    inputs: dict,
    idata: az.InferenceData,
    scaler_params: dict
) -> dict:
    """Wrapper to predict from InferenceData object.
    
    Args:
        inputs: Feature dict
        idata: PyMC InferenceData with posterior
        scaler_params: Training data statistics
        
    Returns:
        Dict with median, ci_lower, ci_upper, samples
    """
    # Extract posterior samples as numpy arrays
    posterior_samples = {
        "intercept": idata.posterior["intercept"].values.flatten(),
        "beta_accommodates": idata.posterior["beta_accommodates"].values.flatten()
    }
    
    return predict_price(inputs, posterior_samples, scaler_params)
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pytest tests/test_bayesian_predictor.py -v
# Expected: 1 passed
```

- [ ] **Step 5: Commit Bayesian predictor**

```bash
git add dashboard/utils/bayesian_predictor.py tests/test_bayesian_predictor.py
git commit -m "feat: add real Bayesian predictor from PyMC posterior

- predict_price() uses MCMC samples, not np.random.normal
- standardize_feature() uses training data stats (not current data)
- Returns median + 95% credible interval
- predict_from_idata() wrapper for InferenceData objects
- TODO: Phase 5 will add bedroom, bathroom, room_type effects

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4.3: Update Prediction Page

**Files:**
- Modify: `dashboard/pages/prediction.py` (replace placeholder with real predictions)

- [ ] **Step 1: Replace prediction page with real Bayesian UI**

```python
# dashboard/pages/prediction.py
"""Price prediction page with real Bayesian inference."""
import streamlit as st
import plotly.graph_objects as go
from ..utils.model_loader import load_trained_model, load_scaler_params
from ..utils.bayesian_predictor import predict_from_idata
from ..utils.styling import get_chart_template, get_chart_palette
from ..utils.session_manager import AppState

def render():
    """Render price prediction page with real PyMC predictions."""
    st.title("Price Prediction")
    
    # Load model
    idata = load_trained_model()
    
    if idata is None:
        st.warning("Trained model not found. Run training script to generate `models/trained_model.nc`")
        st.info("Placeholder UI shown below. Real predictions coming after model training.")
    
    # Input form
    col1, col2 = st.columns(2)
    
    with col1:
        accommodates = st.slider("Accommodates", 1, 16, 2, help="Maximum number of guests")
        bedrooms = st.slider("Bedrooms", 0, 10, 1)
    
    with col2:
        bathrooms = st.slider("Bathrooms", 0.0, 8.0, 1.0, step=0.5)
        beds = st.slider("Beds", 0, 16, 1)
    
    if st.button("Predict Price", type="primary"):
        if idata is None:
            st.error("Cannot predict: model not loaded")
        else:
            with st.spinner("Running Bayesian inference..."):
                inputs = {
                    "accommodates": accommodates,
                    "bedrooms": bedrooms,
                    "bathrooms": bathrooms,
                    "beds": beds
                }
                
                scaler_params = load_scaler_params()
                result = predict_from_idata(inputs, idata, scaler_params)
            
            # Display prediction
            st.success(f"Predicted Price: **${result['median']:.0f}** per night")
            
            st.info(f"95% Credible Interval: ${result['ci_lower']:.0f} - ${result['ci_upper']:.0f}")
            
            # Posterior distribution plot
            theme = st.session_state.get(AppState.THEME, "modern_neutral")
            template = get_chart_template(theme)
            palette = get_chart_palette(theme)
            
            fig = go.Figure()
            fig.add_trace(go.Histogram(
                x=result["samples"],
                nbinsx=50,
                marker_color=palette[0],
                name="Posterior Predictive"
            ))
            
            fig.add_vline(
                x=result["median"],
                line_dash="dash",
                line_color=palette[1],
                annotation_text="Median",
                annotation_position="top"
            )
            
            fig.update_layout(
                title="Posterior Predictive Distribution",
                xaxis_title="Price ($)",
                yaxis_title="Frequency",
                template=template,
                showlegend=False
            )
            
            st.plotly_chart(fig, use_container_width=True)
            
            st.caption("This distribution represents uncertainty in the prediction based on the Bayesian model's posterior samples.")
```

- [ ] **Step 2: Test prediction page locally**

```bash
streamlit run app.py
# Navigate to "Price Prediction"
# Try predicting with accommodates=2
# Expected: Warning about missing model (if not trained yet)
# UI should render without errors
```

- [ ] **Step 3: Commit updated prediction page**

```bash
git add dashboard/pages/prediction.py
git commit -m "feat: replace fake predictions with real Bayesian inference

- Uses load_trained_model() to get PyMC posterior
- Calls predict_from_idata() with user inputs
- Displays median + 95% CI
- Shows posterior predictive distribution histogram
- Graceful fallback if model file missing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4.4: Update Model Insights Page

**Files:**
- Modify: `dashboard/pages/model_insights.py` (add posterior diagnostics)

- [ ] **Step 1: Replace model insights with real posterior visualizations**

```python
# dashboard/pages/model_insights.py
"""Bayesian model insights with posterior diagnostics."""
import streamlit as st
import plotly.graph_objects as go
import arviz as az
from ..utils.model_loader import load_trained_model
from ..utils.styling import get_chart_template, get_chart_palette
from ..utils.session_manager import AppState

def render():
    """Render model insights page with real posteriors."""
    st.title("Model Insights")
    
    idata = load_trained_model()
    
    if idata is None:
        st.warning("Trained model not found. Run training script to generate `models/trained_model.nc`")
        return
    
    theme = st.session_state.get(AppState.THEME, "modern_neutral")
    template = get_chart_template(theme)
    palette = get_chart_palette(theme)
    
    # Model architecture info
    st.subheader("Model Architecture")
    st.write("• Bayesian hierarchical linear regression")
    st.write("• PyMC probabilistic programming")
    st.write("• MCMC sampling with NUTS")
    st.write(f"• Posterior samples: {len(idata.posterior.chain) * len(idata.posterior.draw)}")
    
    # Convergence diagnostics
    st.subheader("Convergence Diagnostics")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.metric("R-hat (intercept)", f"{az.rhat(idata, var_names=['intercept']).to_array().values[0]:.3f}")
        st.caption("R-hat < 1.01 indicates good convergence")
    
    with col2:
        ess = az.ess(idata, var_names=["intercept"]).to_array().values[0]
        st.metric("Effective Sample Size", f"{ess:.0f}")
        st.caption("Higher is better (>1000 ideal)")
    
    # Posterior distributions
    st.subheader("Posterior Distributions")
    
    # Intercept posterior
    intercept_samples = idata.posterior["intercept"].values.flatten()
    
    fig = go.Figure()
    fig.add_trace(go.Histogram(
        x=intercept_samples,
        nbinsx=50,
        marker_color=palette[0],
        name="Intercept"
    ))
    
    fig.update_layout(
        title="Posterior: Intercept (Log-Price Baseline)",
        xaxis_title="Log(Price)",
        yaxis_title="Frequency",
        template=template,
        showlegend=False
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Beta accommodates posterior
    if "beta_accommodates" in idata.posterior:
        beta_samples = idata.posterior["beta_accommodates"].values.flatten()
        
        fig = go.Figure()
        fig.add_trace(go.Histogram(
            x=beta_samples,
            nbinsx=50,
            marker_color=palette[1],
            name="Beta Accommodates"
        ))
        
        fig.update_layout(
            title="Posterior: Accommodates Effect",
            xaxis_title="Coefficient",
            yaxis_title="Frequency",
            template=template,
            showlegend=False
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        median_effect = beta_samples.median()
        st.info(f"Each additional guest increases log-price by {median_effect:.3f} (median estimate)")
    
    # Feature importance (TODO: expand in Phase 5)
    st.subheader("Feature Importance")
    st.info("TODO(Phase 5): Add bedroom, bathroom, room_type effects and relative importance")
```

- [ ] **Step 2: Test model insights page**

```bash
streamlit run app.py
# Navigate to "Model Insights"
# Expected: Warning about missing model (if not trained yet)
# UI should render without errors
```

- [ ] **Step 3: Commit updated model insights page**

```bash
git add dashboard/pages/model_insights.py
git commit -m "feat: add real posterior diagnostics to model insights

- Shows R-hat and ESS for convergence checks
- Displays intercept and beta_accommodates posteriors
- Median effect interpretation
- TODO: Phase 5 will add bedroom, bathroom, room_type
- Graceful fallback if model missing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Plan Self-Review

Before offering execution, checking plan against spec requirements:

**1. Spec Coverage Check:**

Phase 1 (Hosting):
- ✅ requirements.txt with consolidated deps
- ✅ packages.txt for system libraries
- ✅ app.py HF Spaces entry point
- ✅ README with deployment steps
- ✅ Minimal theme updates

Phase 2 (Refactor):
- ✅ Directory structure (pages, components, utils, config)
- ✅ Exception hierarchy (DashboardException → ValidationError → ColumnMappingError, etc.)
- ✅ Session manager with AppState dataclass
- ✅ Theme system (YAML + CSS injection)
- ✅ Pages extraction (6 pages)
- ✅ KPI components
- ✅ Chart components (theme-aware)
- ✅ New app.py router

Phase 3 (CSV Upload):
- ✅ Schema detector with fuzzy matching
- ✅ Data validators with quality checks
- ✅ CSV handler pipeline
- ✅ Upload page with smart progressive UX
- ✅ column_aliases.yaml

Phase 4 (Real Bayesian):
- ✅ Model loader with @st.cache_resource
- ✅ Bayesian predictor with posterior sampling
- ✅ Updated prediction page
- ✅ Updated model insights page
- ✅ scaler_params.json

**2. Placeholder Scan:**
- ✅ No "TBD" or "TODO" in implementation steps
- ✅ All code blocks are complete (no "...")
- ✅ All file paths are explicit
- ✅ All test assertions are specific
- ⚠️ One TODO in Phase 5 scope (bedroom/bathroom effects) - marked as future work, not current plan

**3. Type Consistency:**
- ✅ AppState constants used consistently (DATA_SOURCE, UPLOADED_DF, THEME)
- ✅ Exception names match across tasks (ColumnMappingError, InsufficientDataError)
- ✅ Function signatures match across references (detect_mapping, validate_schema, process_upload, predict_price)
- ✅ Standard column names consistent (price, neighbourhood_cleansed, room_type, accommodates)

**4. Critical Fixes Incorporated:**
- ✅ Phase 2: guard get_active_df() for None, fix occupancy NaN, theme toggle with st.rerun(), Streamlit selector warning
- ✅ Phase 3: trailing period fix, correct column name in validators (use standard_col post-mapping), <st.info> syntax, success message before rerun, IS_PRODUCTION import, YAML columns complete, integer type check, duplicate column prevention, price bounds configurable, file size enforcement, SequenceMatcher scaling note
- ✅ Phase 4: scaler params bug (use training data stats), remove np.random.normal, <st.info> syntax, feature importance TODO

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-20-bayesian-dashboard-transformation.md`.

**Two execution options:**

**1. Subagent-Driven Development (recommended)**
- Fresh subagent per task
- Two-stage review between tasks
- Fast iteration with isolated context
- Better error recovery

**2. Inline Execution**
- Execute tasks in this session using executing-plans skill
- Batch execution with checkpoints for review
- Good for simpler sequential work

Which approach?
