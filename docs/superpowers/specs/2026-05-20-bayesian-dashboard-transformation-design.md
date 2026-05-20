# Bayesian Dashboard Transformation - Design Specification

**Project**: Transform Seattle Airbnb Bayesian Dashboard into universal, recruiter-ready analytics platform  
**Date**: 2026-05-20  
**Scope**: Dashboard UX subsystem (Homepage improvements deferred to separate spec)  
**Effort**: ~60-70 hours across 4 phases  
**Approach**: Risk-first (Phase 1 → 2 → 3 → 4)

---

## Executive Summary

Transform `bayesian-analysis-of-airbnb-seattle-market` from Seattle-only demo into production-grade universal analytics platform. Fix critical sleep problem (Streamlit Cloud → HuggingFace Spaces), refactor 1,170-line monolith into modular architecture, add CSV upload with smart schema detection, implement real Bayesian predictions with PyMC posterior, and apply Modern Neutral visual redesign with dark mode.

**Key deliverables:**
- Always-on hosting (no sleep)
- Modular architecture (pages/, components/, utils/)
- CSV upload for any real estate dataset
- Real Bayesian predictions from PyMC trace
- Modern Neutral theme + dark mode toggle

---

## Target Architecture

### Directory Structure

```
bayesian-dashboard/
├── .streamlit/
│   └── config.toml              # Modern Neutral + Dark theme
├── dashboard/
│   ├── app.py                   # Main router (~150 lines)
│   ├── pages/                   # One file per page
│   │   ├── overview.py
│   │   ├── neighborhood.py
│   │   ├── prediction.py
│   │   ├── market_intel.py
│   │   ├── business_strategy.py
│   │   ├── model_insights.py
│   │   └── upload.py            # Phase 3
│   ├── components/              # Reusable UI (use st.*)
│   │   ├── kpi_cards.py
│   │   ├── charts.py
│   │   ├── filters.py
│   │   ├── insights.py
│   │   ├── column_mapper.py     # Phase 3
│   │   └── data_validator.py    # Phase 3
│   ├── utils/                   # Pure Python (no st.*)
│   │   ├── data_loader.py
│   │   ├── model_loader.py      # Phase 4
│   │   ├── bayesian_predictor.py # Phase 4
│   │   ├── csv_handler.py       # Phase 3
│   │   ├── schema_detector.py   # Phase 3
│   │   ├── validators.py        # Phase 3
│   │   ├── styling.py
│   │   ├── session_manager.py   # NEW
│   │   └── exceptions.py        # NEW
│   └── config/
│       ├── themes.yaml
│       └── column_aliases.yaml  # Phase 3
├── models/
│   ├── seattle_posterior.nc     # Phase 4 - PyMC trace
│   └── scaler_params.json       # Phase 4 - training params
├── tests/
│   ├── test_schema_detector.py  # Priority #1
│   ├── test_validators.py
│   ├── test_csv_handler.py
│   ├── test_model_loader.py
│   └── test_bayesian_predictor.py
├── requirements.txt             # Consolidated
├── packages.txt                 # NEW - system deps for HF Spaces
└── README.md                    # HF Spaces card format
```

### Key Architectural Decisions

1. **Page-based routing** - Manual router in `app.py`, not Streamlit multipage
2. **Component reusability** - Factory functions return Plotly Figures
3. **Data flow** - `app.py` loads once (@st.cache_data), passes to pages
4. **Theme system** - CSS variables + YAML configs, runtime switching
5. **Separation** - Pages = UX, Components = widgets, Utils = business logic

---

## Phase 1: Hosting Migration + Minimal Theme (~5 hours)

**Goal**: Fix sleep problem immediately. Always-on, recruiter-ready.

### 1.1 HuggingFace Spaces Setup

**New files:**
```
app.py (root)           # Entry point → delegates to dashboard/app.py
requirements.txt        # Consolidated, pinned versions
packages.txt           # System dependencies (NEW)
README.md              # HF Spaces card frontmatter
```

**requirements.txt** (consolidated):
```
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
```

**packages.txt** (NEW - system dependencies):
```
build-essential
libblas-dev
liblapack-dev
```

**app.py** (root):
```python
"""HuggingFace Spaces entry point."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from dashboard.app import main

if __name__ == "__main__":
    main()
```

### 1.2 Minimal Theme Updates

**config.toml changes:**
- `backgroundColor = "#ffffff"` (was beige)
- `secondaryBackgroundColor = "#f8f9fa"`
- Keep sage green accent `#77b899`

**Quick CSS injection** (in existing dashboard):
```python
def inject_minimal_theme():
    st.markdown("""
    <style>
    .stMetric {
        background: white;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 3px solid #77b899;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    </style>
    """, unsafe_allow_html=True)
```

### 1.3 Deployment

1. Create HF Space at `huggingface.co/spaces/[username]/bayesian-airbnb-dashboard`
2. Connect GitHub repo
3. Set SDK: Streamlit
4. Git push → auto-deploy
5. Verify no sleep after 24h

**Validation:**
- [ ] Dashboard loads on HF Spaces
- [ ] All 6 pages render
- [ ] Filters work
- [ ] No sleep after 24h idle

**Time**: 3h migration + 2h theme = **5 hours**

---

## Phase 2: Full Refactor + Visual Redesign (~37.5 hours)

**Goal**: Transform monolith into modular architecture. Complete Modern Neutral + dark mode.

### 2.1 Refactor Strategy

**Step 1: Create structure** (0.5h)
```bash
mkdir -p dashboard/{pages,components,utils,config}
touch dashboard/{pages,components,utils,config}/__init__.py
```

**Step 2: Extract pages** (12h)
- Extract 6 page functions from `expert_dashboard.py` monolith
- Each page: `def show(df: pd.DataFrame, model=None)`
- Pages import components, never each other

**Step 3: Extract components** (8h)
- `kpi_cards.py` - Metric displays
- `charts.py` - Plotly factory functions (return Figures only)
- `filters.py` - Sidebar widgets
- `insights.py` - Insight boxes

**Step 4: Extract utils** (4h)
- `session_manager.py` - Type-safe session state
- `exceptions.py` - Custom exception hierarchy
- `data_loader.py` - Data loading with caching
- `styling.py` - Theme system

**Step 5: Build new app.py router** (3h)

```python
# dashboard/app.py
import streamlit as st
from dashboard.utils.session_manager import AppState
from dashboard.utils.data_loader import load_default_data
from dashboard.utils.styling import apply_theme
from dashboard.pages import overview, neighborhood, prediction

PAGES = {
    "Overview": overview,
    "Neighborhood Analysis": neighborhood,
    "Price Prediction": prediction,
    # ...
}

def main():
    st.set_page_config(...)
    AppState.init()
    apply_theme(st.session_state.get(AppState.THEME))
    
    df = load_default_data()
    st.session_state["default_df"] = df
    
    # Sidebar nav
    selected_page = st.sidebar.selectbox("Select Page", list(PAGES.keys()))
    
    # Theme toggle
    theme = st.sidebar.radio(
        "Theme",
        ["modern_neutral", "deep_forest"],
        key=AppState.THEME
    )
    
    # Force re-render on theme change
    if theme != st.session_state.get("_previous_theme"):
        st.session_state["_previous_theme"] = theme
        st.rerun()
    
    # Render page
    active_df = AppState.get_active_df()
    model = st.session_state.get(AppState.MODEL)
    PAGES[selected_page].show(active_df, model)
```

### 2.2 Session Manager (NEW)

```python
# dashboard/utils/session_manager.py
from dataclasses import dataclass
import streamlit as st
import pandas as pd

@dataclass
class AppState:
    """Type-safe session state keys."""
    DATA_SOURCE: str = "data_source"        # "default" | "uploaded"
    UPLOADED_DF: str = "uploaded_df"
    COLUMN_MAP: str = "column_map"
    MODEL: str = "model"
    THEME: str = "theme"
    CURRENT_PAGE: str = "current_page"
    UPLOAD_VALIDATED: str = "upload_validated"
    
    @staticmethod
    def init():
        """Initialize with defaults."""
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
        """Get uploaded or default DataFrame."""
        if st.session_state.get(AppState.DATA_SOURCE) == "uploaded":
            uploaded = st.session_state.get(AppState.UPLOADED_DF)
            if uploaded is not None:
                return uploaded
            # Fallback if corrupted
            st.session_state[AppState.DATA_SOURCE] = "default"
        return st.session_state["default_df"]
    
    @staticmethod
    def reset_to_default():
        """Clear uploaded data, reset to default."""
        for key in [AppState.UPLOADED_DF, AppState.COLUMN_MAP]:
            st.session_state.pop(key, None)
        st.session_state[AppState.DATA_SOURCE] = "default"
        st.rerun()
```

### 2.3 Exception Hierarchy (NEW)

```python
# dashboard/utils/exceptions.py
class DashboardException(Exception):
    """Base exception."""
    pass

class ValidationError(DashboardException):
    """Data validation failed."""
    pass

class ColumnMappingError(ValidationError):
    """Required column not found."""
    def __init__(self, missing_columns: list[str]):
        self.missing_columns = missing_columns
        super().__init__(f"Missing: {', '.join(missing_columns)}")

class InsufficientDataError(ValidationError):
    """Dataset too small."""
    def __init__(self, rows: int, min_required: int = 50):
        self.rows = rows
        self.min_required = min_required
        super().__init__(f"{rows} rows, minimum {min_required} required")

class ModelLoadError(DashboardException):
    """PyMC model load failed."""
    pass

class PredictionError(DashboardException):
    """Prediction generation failed."""
    pass
```

### 2.4 Visual Redesign

**themes.yaml:**
```yaml
modern_neutral:
  name: "Modern Neutral"
  is_dark: false
  colors:
    bg_primary: "#ffffff"
    bg_secondary: "#f8f9fa"
    text_primary: "#212529"
    accent: "#77b899"
    border: "#dee2e6"
    shadow: "0 1px 3px rgba(0,0,0,0.12)"
  chart:
    template: "plotly_white"
    palette: ["#77b899", "#0d6efd", "#fd7e14", "#6f42c1"]

deep_forest:
  name: "Deep Forest"
  is_dark: true
  colors:
    bg_primary: "#1a1a2e"
    bg_secondary: "#16213e"
    text_primary: "#e0e0e0"
    accent: "#77b899"
    border: "#2d2d44"
    shadow: "0 2px 8px rgba(0,0,0,0.4)"
  chart:
    template: "plotly_dark"
    palette: ["#77b899", "#8ecae6", "#ff9f40", "#a78bfa"]
```

**styling.py:**
```python
def apply_theme(theme_name: str = "modern_neutral"):
    """Inject CSS variables from YAML config."""
    theme = load_theme_config(theme_name)
    colors = theme["colors"]
    
    css = f"""
    <style>
    :root {{
        --bg-primary: {colors['bg_primary']};
        --text-primary: {colors['text_primary']};
        --accent: {colors['accent']};
        /* ... */
    }}
    
    .stApp {{ background-color: var(--bg-primary); }}
    div[data-testid="stMetric"] {{
        background: var(--bg-card);
        border-left: 3px solid var(--accent);
        box-shadow: var(--shadow);
    }}
    /* WARNING: Targets Streamlit 1.38.0 internal DOM */
    </style>
    """
    st.markdown(css, unsafe_allow_html=True)
```

### 2.5 Plotly Migration

Update all chart functions to use theme-aware colors:

```python
# dashboard/components/charts.py
from ..utils.styling import get_chart_template, get_chart_palette

def price_distribution(df: pd.DataFrame) -> go.Figure:
    """Returns Figure only - caller handles st.plotly_chart()."""
    theme = st.session_state.get(AppState.THEME, "modern_neutral")
    template = get_chart_template(theme)
    palette = get_chart_palette(theme)
    
    fig = go.Figure()
    fig.add_trace(go.Histogram(
        x=df["price_clean"],
        marker_color=palette[0]
    ))
    fig.update_layout(template=template)
    return fig
```

### 2.6 Fixes from Review

1. ✅ Guard `get_active_df()` for None case
2. ✅ Fix occupancy NaN: `df["availability_365"].dropna().mean()`
3. ✅ Add TODO: error bars → HDI in Phase 4
4. ✅ Warning comment on Streamlit selector fragility
5. ✅ Theme toggle with `st.rerun()`

**Time**: 37.5h (18h refactor + 12h visual + 6h theme system + 1.5h fixes)

---

## Phase 3: CSV Upload (~30 hours)

**Goal**: Universal dataset support. Smart progressive UX.

### 3.1 Architecture

**Core components:**
- `schema_detector.py` - Fuzzy column matching (SequenceMatcher)
- `validators.py` - Data quality checks
- `csv_handler.py` - Processing pipeline (pure Python)
- `pages/upload.py` - UI with progressive disclosure
- `components/column_mapper.py` - Mapping table display
- `components/data_validator.py` - Issue report display
- `config/column_aliases.yaml` - Column specs

### 3.2 Schema Detection

```python
# dashboard/utils/schema_detector.py
from difflib import SequenceMatcher

class ColumnMapper:
    def detect_mapping(self, df: pd.DataFrame) -> Dict[str, Tuple[str, float]]:
        """Auto-detect with confidence scores."""
        mapping = {}
        assigned_cols = set()  # Prevent duplicate assignments
        
        for standard_col, spec in self.config.items():
            aliases = spec.get("aliases", [])
            best_match = None
            best_score = 0.0
            
            for user_col in df.columns:
                if user_col in assigned_cols:
                    continue
                
                # Exact match
                if user_col.lower() in [a.lower() for a in aliases]:
                    best_match = user_col
                    best_score = 1.0
                    break
                
                # Fuzzy (70% threshold)
                for alias in aliases:
                    score = SequenceMatcher(None, user_col.lower(), alias.lower()).ratio()
                    if score > best_score and score > 0.7:
                        best_match = user_col
                        best_score = score
            
            if best_match:
                mapping[standard_col] = (best_match, best_score)
                assigned_cols.add(best_match)
        
        return mapping
```

**Note**: SequenceMatcher is O(n×m). For >100 columns, consider `rapidfuzz`.

### 3.3 Data Validation

```python
# dashboard/utils/validators.py
class DataValidator:
    def validate(self, df: pd.DataFrame, column_map: Dict) -> Tuple[bool, List[Dict]]:
        """Returns (is_valid, issues_list)."""
        issues = []
        
        # 1. Row count
        if len(df) < self.min_rows:
            issues.append({
                "level": "error",
                "check": "row_count",
                "message": f"{len(df)} rows, minimum {self.min_rows} required"
            })
        
        # 2. Null percentage
        for col in df.columns:
            null_pct = df[col].isna().sum() / len(df) * 100
            if null_pct > 50:
                issues.append({"level": "error", "message": f"'{col}' is {null_pct:.1f}% null"})
            elif null_pct > 10:
                issues.append({"level": "warning", "message": f"'{col}' is {null_pct:.1f}% null"})
        
        # 3. Type validation (use standard_col after rename)
        for standard_col, (user_col, _) in column_map.items():
            expected_type = self._get_expected_type(standard_col)
            actual_type = df[standard_col].dtype  # FIXED: post-rename column name
            
            if expected_type == "numeric" and not pd.api.types.is_numeric_dtype(actual_type):
                # Try coercion
                try:
                    pd.to_numeric(df[standard_col])
                    issues.append({"level": "info", "message": f"'{user_col}' will convert to numeric"})
                except:
                    issues.append({"level": "error", "message": f"'{user_col}' cannot convert to numeric"})
            
            elif expected_type == "integer" and not pd.api.types.is_integer_dtype(actual_type):
                # Try integer coercion
                try:
                    pd.to_numeric(df[standard_col], downcast='integer')
                    issues.append({"level": "info", "message": f"'{user_col}' will convert to integer"})
                except:
                    issues.append({"level": "error", "message": f"'{user_col}' cannot convert to integer"})
        
        has_errors = any(i["level"] == "error" for i in issues)
        return (not has_errors, issues)
```

### 3.4 CSV Processing Pipeline

```python
# dashboard/utils/csv_handler.py
class CSVProcessor:
    def process_upload(self, uploaded_file, user_overrides=None):
        """Full pipeline: load → detect → validate → clean."""
        df = pd.read_csv(uploaded_file)
        
        auto_mapping = self.mapper.detect_mapping(df)
        if user_overrides:
            auto_mapping.update(user_overrides)
        
        is_complete, missing = self.mapper.validate_mapping(auto_mapping)
        if not is_complete:
            raise ColumnMappingError(missing)
        
        df_mapped = self.mapper.apply_mapping(df, auto_mapping)
        
        is_valid, issues = self.validator.validate(df_mapped, auto_mapping)
        if not is_valid:
            raise ValidationError(f"{sum(1 for i in issues if i['level']=='error')} errors")
        
        df_cleaned = self._clean_dataframe(df_mapped)
        
        return df_cleaned, auto_mapping, issues
```

### 3.5 Upload Page (Smart Progressive)

```python
# dashboard/pages/upload.py
def show(df: pd.DataFrame, model=None):
    st.title("📤 Upload Custom Dataset")
    
    # Show success from previous load
    if st.session_state.pop("_upload_success", None):
        st.success(st.session_state["_upload_success"])
    
    uploaded_file = st.file_uploader("Choose CSV", type=["csv"])
    
    if uploaded_file is None:
        st.info("👆 Upload CSV to begin")  # FIXED: no <st.info>
        return
    
    # File size check
    file_size_mb = len(uploaded_file.getvalue()) / (1024 * 1024)
    if file_size_mb > 100:
        st.error(f"❌ File too large: {file_size_mb:.1f}MB (max 100MB)")
        return
    
    processor = CSVProcessor()
    
    try:
        with st.spinner("Analyzing CSV..."):
            df_clean, mapping, issues = processor.process_upload(uploaded_file)
        
        # Smart progressive
        has_warnings = any(i["level"] == "warning" for i in issues)
        
        if not has_warnings:
            st.success(f"✅ {len(df_clean):,} rows validated")
            if st.button("Load Dataset", type="primary"):
                _load_dataset(df_clean, mapping)
        else:
            st.warning(f"⚠️ {len(issues)} warnings")
            
            with st.expander("🔗 Column Mapping", expanded=True):
                render_mapping_ui(mapping, df_clean.columns)
            
            with st.expander("✓ Validation Report", expanded=True):
                render_validation_report(issues)
            
            if st.button("Load Dataset", type="primary"):
                _load_dataset(df_clean, mapping)
    
    except ColumnMappingError as e:
        st.error("❌ Column Mapping Failed")
        st.markdown(f"**Missing:** {', '.join(e.missing_columns)}")
    except ValidationError as e:
        st.error(f"❌ Validation Failed: {e}")
    except Exception as e:
        st.error(f"❌ Upload Error: {e}")
        if not IS_PRODUCTION:
            st.exception(e)

def _load_dataset(df: pd.DataFrame, mapping: Dict):
    """Load into session, trigger rerun with success message."""
    st.session_state[AppState.UPLOADED_DF] = df
    st.session_state[AppState.COLUMN_MAP] = mapping
    st.session_state[AppState.DATA_SOURCE] = "uploaded"
    st.session_state["_upload_success"] = f"{len(df):,} rows loaded!"  # Persist across rerun
    st.rerun()
```

### 3.6 Column Aliases Config

```yaml
# dashboard/config/column_aliases.yaml
price:
  aliases: [price, nightly_price, rate, cost, rent, price_usd, nightly_rate]
  required: true
  type: numeric
  validation:
    min: 10
    max: null  # No upper bound (NYC/SF have >$10k listings)

accommodates:
  aliases: [accommodates, guests, max_guests, capacity, sleeps]
  required: true
  type: integer

neighbourhood_cleansed:
  aliases: [neighbourhood_cleansed, neighborhood, area, district, zone]
  required: true
  type: categorical

room_type:
  aliases: [room_type, property_type, listing_type, type]
  required: true
  type: categorical

bedrooms:
  aliases: [bedrooms, bedroom_count, n_bedrooms]
  required: false
  type: integer
  default_if_missing: 0

bathrooms:
  aliases: [bathrooms, bathroom_count, baths]
  required: false
  type: numeric
  default_if_missing: 1

beds:
  aliases: [beds, bed_count, n_beds]
  required: false
  type: integer
  default_if_missing: 1

number_of_reviews:
  aliases: [number_of_reviews, review_count, reviews, total_reviews]
  required: false
  type: integer
  default_if_missing: 0

review_scores_rating:
  aliases: [review_scores_rating, rating, score, overall_rating]
  required: false
  type: numeric
  default_if_missing: 0

availability_365:
  aliases: [availability_365, availability, days_available]
  required: false
  type: integer
  default_if_missing: 365
```

### 3.7 Fixes from Review

1. ✅ Fix syntax: trailing period in `schema_detector.py` line 25
2. ✅ Use `standard_col` not `user_col` in validators post-rename
3. ✅ Add integer type check
4. ✅ Fix `<st.info>` syntax
5. ✅ Success message via `_upload_success` session key + rerun
6. ✅ Import `IS_PRODUCTION`
7. ✅ Add complete YAML columns (bedrooms, bathrooms, beds, etc.)
8. ✅ Duplicate column prevention in `detect_mapping()`
9. ✅ Configurable price bounds (null = no upper limit)
10. ✅ File size enforcement (100MB check)
11. ✅ SequenceMatcher scaling note

**Time**: 30h (6h schema + 4h validation + 4h pipeline + 6h UI + 4h components + 6h tests)

---

## Phase 4: Real Bayesian Predictions (~6-8 hours)

**Goal**: Load actual PyMC posterior. Honest credible intervals.

### 4.1 Model Loader

```python
# dashboard/utils/model_loader.py
import arviz as az
import streamlit as st

@st.cache_resource  # NOT @st.cache_data (resource, not serializable data)
def load_posterior_trace(trace_path=None) -> Optional[az.InferenceData]:
    """Load pre-trained PyMC trace from NetCDF."""
    if trace_path is None:
        trace_path = Path(__file__).parent.parent.parent / "models" / "seattle_posterior.nc"
    
    if not trace_path.exists():
        warnings.warn(f"Model not found: {trace_path}")
        return None
    
    try:
        trace = az.from_netcdf(str(trace_path))
        
        # Validate structure
        required_vars = ["alpha", "beta_acc", "sigma"]
        missing = [v for v in required_vars if v not in trace.posterior.data_vars]
        if missing:
            raise ModelLoadError(f"Missing variables: {missing}")
        
        return trace
    except Exception as e:
        raise ModelLoadError(f"Load failed: {e}")

def get_model_info(trace: az.InferenceData) -> dict:
    """Extract metadata for display."""
    if trace is None:
        return {"available": False}
    
    posterior = trace.posterior
    summary = az.summary(trace, var_names=["alpha", "beta_acc", "sigma"])
    
    return {
        "available": True,
        "n_chains": posterior.dims["chain"],
        "n_draws": posterior.dims["draw"],
        "n_neighborhoods": posterior.dims["neighbourhood"],
        "convergence": {
            "max_rhat": float(summary["r_hat"].max()),
            "min_ess_bulk": float(summary["ess_bulk"].min()),
            "converged": summary["r_hat"].max() < 1.01
        }
    }
```

### 4.2 Bayesian Predictor

```python
# dashboard/utils/bayesian_predictor.py
import json

class BayesianPredictor:
    def __init__(self, trace: Optional[az.InferenceData] = None):
        self.trace = trace
        self.has_model = trace is not None
        self.scaler_params = self._load_scaler_params() if trace else None
    
    def _load_scaler_params(self) -> Optional[Dict]:
        """Load training data params (mean/std) for standardization."""
        params_path = Path(__file__).parent.parent.parent / "models" / "scaler_params.json"
        if params_path.exists():
            return json.loads(params_path.read_text())
        return None
    
    def predict_price(self, df: pd.DataFrame, features: Dict) -> Dict:
        """Generate prediction from posterior or heuristic."""
        if not self.has_model:
            return self._heuristic_prediction(df, features)
        
        try:
            return self._bayesian_prediction(df, features)
        except Exception as e:
            warnings.warn(f"Bayesian prediction failed: {e}")
            result = self._heuristic_prediction(df, features)
            result["fallback_reason"] = str(e)
            return result
    
    def _bayesian_prediction(self, df: pd.DataFrame, features: Dict) -> Dict:
        """Real posterior predictive."""
        posterior = self.trace.posterior
        
        # Get neighborhood index
        neighborhood = features["neighbourhood_cleansed"]
        neighborhood_map = self.scaler_params.get("neighborhood_map", {})
        
        if neighborhood not in neighborhood_map:
            # OOD
            result = self._heuristic_prediction(df, features)
            result["ood_warning"] = True
            result["ood_reason"] = f"'{neighborhood}' not in training data"
            return result
        
        n_idx = neighborhood_map[neighborhood]
        
        # Extract posterior samples
        alpha_samples = posterior["alpha"].values[:, :, n_idx].flatten()
        beta_acc_samples = posterior["beta_acc"].values[:, :, n_idx].flatten()
        
        # Standardize using TRAINING params (not current df)
        acc_mean = self.scaler_params["accommodates_mean"]
        acc_std = self.scaler_params["accommodates_std"]
        acc_std_val = (features["accommodates"] - acc_mean) / acc_std
        
        # Linear predictor
        log_price_samples = alpha_samples + beta_acc_samples * acc_std_val
        
        # NO random noise addition (removed per review)
        # Transform to price scale
        price_samples = np.exp(log_price_samples)
        
        # Compute quantiles
        point = np.median(price_samples)
        ci_80 = np.percentile(price_samples, [10, 90])
        ci_95 = np.percentile(price_samples, [2.5, 97.5])
        
        return {
            "point_estimate": float(point),
            "ci_80_lower": float(ci_80[0]),
            "ci_80_upper": float(ci_80[1]),
            "ci_95_lower": float(ci_95[0]),
            "ci_95_upper": float(ci_95[1]),
            "method": "bayesian",
            "ood_warning": False,
            "n_posterior_samples": len(price_samples)
        }
    
    def _heuristic_prediction(self, df: pd.DataFrame, features: Dict) -> Dict:
        """Fallback: mean/std of similar listings."""
        similar = df[
            (df["neighbourhood_cleansed"] == features["neighbourhood_cleansed"]) &
            (df["room_type"] == features["room_type"]) &
            (df["accommodates"].between(features["accommodates"]-1, features["accommodates"]+1))
        ]
        
        if len(similar) < 5:
            similar = df[df["neighbourhood_cleansed"] == features["neighbourhood_cleansed"]]
        if len(similar) == 0:
            similar = df
        
        mean = similar["price_clean"].mean()
        std = similar["price_clean"].std()
        
        return {
            "point_estimate": float(mean),
            "ci_80_lower": float(max(0, mean - 1.28*std)),
            "ci_80_upper": float(mean + 1.28*std),
            "ci_95_lower": float(max(0, mean - 1.96*std)),
            "ci_95_upper": float(mean + 1.96*std),
            "method": "heuristic",
            "ood_warning": False,
            "n_similar_listings": len(similar)
        }
    
    def get_feature_importance(self) -> Optional[pd.DataFrame]:
        """Extract from posterior."""
        if not self.has_model:
            return None
        
        beta_acc = self.trace.posterior["beta_acc"].values.flatten()
        
        # TODO(Phase 5): Add bedroom, bathroom, room_type effects
        return pd.DataFrame({
            "feature": ["accommodates"],
            "mean_effect": [float(np.mean(beta_acc))],
            "hdi_lower": [float(az.hdi(beta_acc, hdi_prob=0.95)[0])],
            "hdi_upper": [float(az.hdi(beta_acc, hdi_prob=0.95)[1])]
        })
```

### 4.3 Updated Prediction Page

```python
# dashboard/pages/prediction.py
def show(df: pd.DataFrame, model=None):
    st.title("💰 Bayesian Price Prediction")
    
    predictor = BayesianPredictor(model)
    
    if predictor.has_model:
        info = get_model_info(model)
        if info["convergence"]["converged"]:
            st.success(f"✅ Using trained model ({info['n_draws']} samples)")
        else:
            st.warning(f"⚠️ Model loaded but R̂={info['convergence']['max_rhat']:.3f}")
    else:
        st.info("ℹ️ Using comparative market analysis")  # FIXED: was <st.info>
    
    # Input form (existing code)
    # ...
    
    if st.button("Generate Price Prediction", type="primary"):
        features = { ... }
        
        spinner_text = "Computing posterior predictive..." if predictor.has_model else "Analyzing comparable listings..."
        with st.spinner(spinner_text):
            result = predictor.predict_price(df, features)
        
        # Display results
        if result.get("ood_warning"):
            st.warning(f"⚠️ {result['ood_reason']}")
        
        # KPI cards
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Predicted Price", f"${result['point_estimate']:.0f}")
        # ...
        
        # Method disclosure
        if result['method'] == 'heuristic':
            st.caption(f"ℹ️ Method: Comparative analysis ({result['n_similar_listings']} listings)")
        else:
            st.caption(f"ℹ️ Method: Bayesian posterior ({result['n_posterior_samples']} samples)")
```

### 4.4 Model Training Script

```python
# scripts/train_model.py (offline - not in dashboard)
def train_seattle_model():
    """Train and serialize model."""
    df = pd.read_csv("data/raw/listings.csv")
    # ... clean data ...
    
    # Build PyMC model
    with pm.Model() as model:
        # Hierarchical structure
        alpha = pm.Normal("alpha", mu=mu_alpha, sigma=sigma_alpha, shape=n_neighborhoods)
        beta_acc = pm.Normal("beta_acc", mu=mu_beta, sigma=sigma_beta, shape=n_neighborhoods)
        # ...
        trace = pm.sample(2000, tune=1000, chains=4)
    
    # Save trace
    idata = az.from_pymc(trace, model=model)
    idata.to_netcdf("models/seattle_posterior.nc")
    
    # Save scaler params
    scaler_params = {
        "accommodates_mean": float(df["accommodates"].mean()),
        "accommodates_std": float(df["accommodates"].std()),
        "neighborhood_map": neighborhood_map
    }
    Path("models/scaler_params.json").write_text(json.dumps(scaler_params))
```

### 4.5 Fixes from Review

1. ✅ Store scaler params with model (separate JSON)
2. ✅ Remove `np.random.normal` noise (overstates uncertainty)
3. ✅ Fix `<st.info>` syntax
4. ✅ Add TODO for Phase 5 feature expansion
5. ✅ Use training params for standardization, not current df

**Time**: 6-8h (3h model loader + 4h predictor + 1h UI updates)

---

## Data Flow Patterns

### Application Startup
```
User opens → app.main()
  → AppState.init()
  → apply_theme()
  → load_default_data() @cached
  → load_posterior_trace() @cached
  → Store in session_state
  → Render sidebar
  → Route to page
  → Page(df, model)
```

### CSV Upload Flow
```
Upload CSV → upload.py
  → CSVProcessor.process_upload()
    → pd.read_csv()
    → ColumnMapper.detect()
    → DataValidator.validate()
    → Clean
  → Smart check: warnings?
    → No: direct load
    → Yes: show details
  → "Load Dataset" → _load_dataset()
    → Update session_state
    → st.rerun()
  → All pages use AppState.get_active_df()
```

### Prediction Flow
```
Enter features → "Generate Prediction"
  → BayesianPredictor.predict_price(df, features)
    → Has model?
      → YES: _bayesian_prediction()
      → NO: _heuristic_prediction()
    → Both return same structure
  → Render KPIs + chart + insight + method disclosure
```

### Theme Toggle Flow
```
User clicks theme radio
  → session_state[THEME] updates
  → Detect change in app.py
  → st.rerun()
  → apply_theme(new_theme)
    → Inject CSS variables
    → Return chart template
  → All pages re-render
  → Charts use new template
```

### Error Recovery Flow
```
Error occurs
  → Page catches exception
  → st.error() + guidance
  → [Reset to Default] button
    → AppState.reset_to_default()
    → Clear session keys
    → st.rerun()
```

---

## Error Handling Strategy

### Exception Hierarchy
```
DashboardException
├── ValidationError
│   ├── ColumnMappingError
│   ├── InsufficientDataError
│   └── DataQualityError
├── ModelLoadError
└── PredictionError
```

### Handling by Layer

**Page-level** (catch, render to user):
```python
try:
    result = operation()
except ColumnMappingError as e:
    st.error(f"❌ Column Mapping Failed: {e}")
    st.info("Check CSV column names")
except ValidationError as e:
    st.error(f"❌ Validation Failed: {e}")
except ModelLoadError as e:
    st.warning(f"⚠️ Model Load Failed: {e}")
    st.info("Falling back to heuristic predictions")
except Exception as e:
    error_id = str(uuid.uuid4())[:8]
    logger.error(f"[{error_id}] {e}", exc_info=e)
    st.error(f"❌ Error ID: {error_id}")
    if not IS_PRODUCTION:
        st.exception(e)
```

**Utils-level** (raise, don't handle):
```python
def process_data(df):
    if len(df) < 50:
        raise InsufficientDataError(len(df))
    # Don't catch - let page handle
```

**Component-level** (defensive, graceful):
```python
def render_chart(df):
    if df is None or len(df) == 0:
        st.warning("No data available")
        return
    try:
        fig = create_figure(df)
        st.plotly_chart(fig)
    except Exception as e:
        st.error(f"Chart failed: {e}")
        st.dataframe(df.head())  # Fallback
```

### Fallback Strategies

| Failure | Action | Message | Severity |
|---------|--------|---------|----------|
| Model load fails | Heuristic predictions | "Using comparative analysis" | info |
| Column missing | Manual mapping UI | "Map columns manually" | warning |
| Validation errors | Show issues, allow override | "X warnings found" | warning |
| Neighborhood OOD | City-wide heuristic | "Using city-wide data" | warning |
| Chart render fail | Data table | "Showing data table" | error |
| Theme load fails | Default theme | (silent) | - |

### Logging
```python
# dashboard/utils/logging_config.py
import logging

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logging.getLogger("pymc").setLevel(logging.WARNING)
    logging.getLogger("arviz").setLevel(logging.WARNING)
```

---

## Critical Fixes Checklist

### Phase 1
- [x] Consolidate requirements.txt
- [x] Add packages.txt (build-essential, libblas-dev, liblapack-dev)

### Phase 2
- [x] Guard `get_active_df()` for None
- [x] Fix occupancy NaN handling
- [x] Add HDI TODO comment
- [x] Streamlit selector warning
- [x] Theme toggle with st.rerun()
- [x] Time estimate: 37.5h not 30h

### Phase 3 (7 critical + 4 important)
- [x] Fix trailing period syntax (schema_detector.py:25)
- [x] Use standard_col not user_col post-rename (validators.py)
- [x] Add integer type check
- [x] Fix `<st.info>` syntax (upload.py)
- [x] Success message via session key + rerun
- [x] Import IS_PRODUCTION
- [x] Complete YAML columns (bedrooms, bathrooms, beds)
- [x] Duplicate column prevention
- [x] Configurable price bounds (null = no limit)
- [x] File size enforcement (100MB)
- [x] SequenceMatcher scaling note

### Phase 4
- [x] Store scaler params separately (scaler_params.json)
- [x] Remove np.random.normal noise
- [x] Fix `<st.info>` syntax
- [x] Add Phase 5 TODO for features

---

## Validation Criteria

### Phase 1
- [ ] Dashboard loads on HuggingFace Spaces
- [ ] All 6 pages render
- [ ] Filters work
- [ ] Charts display
- [ ] No sleep after 24h idle
- [ ] White background applied

### Phase 2
- [ ] All pages work in new structure
- [ ] Dark mode toggle works
- [ ] Charts use theme colors
- [ ] KPI cards styled consistently
- [ ] No import errors
- [ ] Session state typed
- [ ] Tests pass

### Phase 3
- [ ] Upload Seattle CSV → perfect auto-detection
- [ ] Upload renamed columns → fuzzy match works
- [ ] Upload invalid CSV → clear errors
- [ ] Switch default/uploaded → works
- [ ] All 6 pages work with uploaded data
- [ ] Charts render with new data

### Phase 4
- [ ] Model loads on startup (cached)
- [ ] Predictions use real posterior
- [ ] Feature importance from model
- [ ] OOD warnings work
- [ ] Graceful fallback if model missing
- [ ] Convergence diagnostics shown

---

## Time Summary

| Phase | Hours | Notes |
|-------|-------|-------|
| Phase 1: Hosting | 5 | HF Spaces + minimal theme |
| Phase 2: Refactor + Visual | 37.5 | Modular structure + Modern Neutral |
| Phase 3: CSV Upload | 30 | Schema detection + validation + UI |
| Phase 4: Real Bayesian | 6-8 | PyMC loader + predictor |
| **Total** | **78.5-80.5** | ~80 hours |

---

## Next Steps

1. ✅ Design approved with fixes tracked
2. ⏭️ Spec self-review (check for placeholders, contradictions, ambiguity)
3. ⏭️ User reviews written spec
4. ⏭️ Invoke `writing-plans` skill for implementation plan

---

## References

- Analysis docs: `site improv+2/Kimi_Agent_Revamp Bayesian Dashboard for Recruiters/`
- Current repo: `bayesian-analysis-of-airbnb-seattle-market/`
- HuggingFace Spaces: https://huggingface.co/docs/hub/spaces
- PyMC docs: https://www.pymc.io/
- ArviZ docs: https://python.arviz.org/
- Streamlit docs: https://docs.streamlit.io/

---

**Design Status**: Complete, pending implementation
