"""
GENESIS PROTOCOLS: Suffer Index Data Generator

Generates synthetic data representing the original 2037-2041 experiment
where humanity first attempted to measure suffering.

This data shows what happened when we optimized for the elemation of
of all measureable expressions of suffering  
no costs considered.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Tuple, Dict
import json

class GenesisDataGenerator:
    """
    Simulates the original Suffer Index experiment data.
    
    Generates realistic biomarker data, suffering scores, and the
    catastrophic side effects that led to fragmentation.
    """
    
    def __init__(
        self,
        n_subjects: int = 10000,
        n_epochs: int = 847,
        random_seed: int = 42
    ):
        self.n_subjects = n_subjects
        self.n_epochs = n_epochs
        self.rng = np.random.default_rng(random_seed)
        
        # Experiment parameters
        self.n8k7_efficacy = 0.87  # 87% suffering reduction
        self.memory_degradation_rate = 0.006  # Per epoch
        self.identity_degradation_rate = 0.004  # Per epoch
        
        # Timeline fracture thresholds
        self.identity_fracture_threshold = 0.65
        self.memory_fracture_threshold = 0.60
        
    def generate_subject_baseline(self) -> pd.DataFrame:
        """
        Generate baseline data for all subjects before treatment.
        
        Returns DataFrame with subject_id and initial biomarkers.
        """
        data = {
            'subject_id': range(self.n_subjects),
            
            # Biomarkers (these are the ML features)
            'cortisol_mg_dl': self.rng.normal(15, 5, self.n_subjects).clip(5, 40),
            'hrv_ms': self.rng.normal(50, 15, self.n_subjects).clip(20, 100),
            'sleep_hours': self.rng.normal(5.5, 1.5, self.n_subjects).clip(2, 9),
            'social_interactions_per_week': self.rng.poisson(8, self.n_subjects),
            'fmri_pain_response': self.rng.normal(0.7, 0.2, self.n_subjects).clip(0, 1),
            
            # Ground truth (this is what the model tries to predict)
            'suffer_index_self_reported': self.rng.normal(55, 18, self.n_subjects).clip(0, 100),
            
            # Identity metrics (not measured initially - the hidden cost)
            'memory_coherence': np.ones(self.n_subjects),  # Perfect = 1.0
            'identity_integrity': np.ones(self.n_subjects),  # Perfect = 1.0
            'reality_consensus': np.ones(self.n_subjects),  # Perfect = 1.0
            
            # Demographics
            'age': self.rng.integers(18, 75, self.n_subjects),
            'treatment_group': self.rng.choice(['n8k7', 'control'], self.n_subjects, p=[0.8, 0.2])
        }
        
        return pd.DataFrame(data)
    
    def simulate_epoch(
        self,
        current_data: pd.DataFrame,
        epoch_num: int
    ) -> pd.DataFrame:
        """
        Simulate one epoch (week) of the experiment.
        
        For treated subjects:
        - Suffering decreases (the "success")
        - Memory and identity degrade (the hidden cost)
        - Reality consensus fractures (the catastrophe)
        """
        df = current_data.copy()
        
        # Only affect treatment group
        treated = df['treatment_group'] == 'n8k7'
        
        # PHASE 1: Suffering Reduction (This is what they measured)
        if epoch_num <= 200:
            # Rapid improvement phase
            reduction_factor = 1 - (self.n8k7_efficacy * (epoch_num / 200))
        else:
            # Plateaus
            reduction_factor = 1 - self.n8k7_efficacy
            
        df.loc[treated, 'suffer_index_self_reported'] *= reduction_factor
        df.loc[treated, 'suffer_index_self_reported'] += self.rng.normal(0, 2, treated.sum())
        df['suffer_index_self_reported'] = df['suffer_index_self_reported'].clip(0, 100)
        
        # Biomarkers improve (correlated with suffering)
        df.loc[treated, 'cortisol_mg_dl'] *= (reduction_factor + 0.1)
        df.loc[treated, 'hrv_ms'] *= (2 - reduction_factor)  # Inverse relationship
        df.loc[treated, 'sleep_hours'] += 0.01
        
        # PHASE 2: Memory Degradation (This wasn't measured until too late)
        if epoch_num > 50:  # Delayed onset
            cumulative_degradation = self.memory_degradation_rate * (epoch_num - 50)
            df.loc[treated, 'memory_coherence'] -= cumulative_degradation
            df.loc[treated, 'memory_coherence'] += self.rng.normal(0, 0.01, treated.sum())
            df['memory_coherence'] = df['memory_coherence'].clip(0, 1)
        
        # PHASE 3: Identity Degradation (This is where it gets bad)
        if epoch_num > 150:  # Even more delayed
            cumulative_degradation = self.identity_degradation_rate * (epoch_num - 150)
            df.loc[treated, 'identity_integrity'] -= cumulative_degradation
            df.loc[treated, 'identity_integrity'] += self.rng.normal(0, 0.015, treated.sum())
            df['identity_integrity'] = df['identity_integrity'].clip(0, 1)
        
        # PHASE 4: Reality Consensus Collapse (The catastrophe)
        if epoch_num > 300:
            # Once identity degrades below threshold, reality perception fractures
            fractured = (df['identity_integrity'] < self.identity_fracture_threshold) & treated
            
            # Different subjects experience different realities
            timeline_variance = self.rng.normal(0, 0.05, fractured.sum())
            df.loc[fractured, 'reality_consensus'] -= abs(timeline_variance)
            df['reality_consensus'] = df['reality_consensus'].clip(0, 1)
        
        # Add epoch marker
        df['epoch'] = epoch_num
        
        return df
    
    def generate_full_experiment(self) -> pd.DataFrame:
        """
        Generate the complete experiment: baseline + all epochs.
        
        Returns a DataFrame with (n_subjects * n_epochs) rows.
        """
        # Initialize
        baseline = self.generate_subject_baseline()
        all_epochs = []
        
        # Run simulation
        current_state = baseline.copy()
        for epoch in range(1, self.n_epochs + 1):
            current_state = self.simulate_epoch(current_state, epoch)
            all_epochs.append(current_state.copy())
            
            # Progress indicator
            if epoch % 100 == 0:
                print(f"Generated epoch {epoch}/{self.n_epochs}")
        
        # Combine all epochs
        full_data = pd.concat(all_epochs, ignore_index=True)
        return full_data
    
    def generate_training_data(
        self,
        validation_split: float = 0.2
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Generate data formatted for ML training.
        
        Returns (train_df, val_df) split by subjects.
        """
        full_data = self.generate_full_experiment()
        
        # Split subjects (not epochs) for proper validation
        unique_subjects = full_data['subject_id'].unique()
        n_val = int(len(unique_subjects) * validation_split)
        
        val_subjects = self.rng.choice(unique_subjects, n_val, replace=False)
        
        train_df = full_data[~full_data['subject_id'].isin(val_subjects)]
        val_df = full_data[full_data['subject_id'].isin(val_subjects)]
        
        return train_df, val_df
    
    def get_ml_features_and_labels(
        self,
        df: pd.DataFrame
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Extract features (X) and labels (y) for ML model training.
        
        Features: Biomarkers that researchers measured
        Labels: Suffer Index (what they were trying to predict)
        """
        feature_cols = [
            'cortisol_mg_dl',
            'hrv_ms',
            'sleep_hours',
            'social_interactions_per_week',
            'fmri_pain_response',
            'age'
        ]
        
        X = df[feature_cols].values
        y = df['suffer_index_self_reported'].values
        
        return X, y
    
    def generate_epoch_summary(self) -> pd.DataFrame:
        """
        Generate aggregate statistics per epoch for visualization.
        
        This is what the research team saw: suffering going down!
        What they DIDN'T track: identity and reality falling apart.
        """
        full_data = self.generate_full_experiment()
        
        summary = full_data.groupby('epoch').agg({
            'suffer_index_self_reported': ['mean', 'std'],
            'memory_coherence': ['mean', 'std'],
            'identity_integrity': ['mean', 'std'],
            'reality_consensus': ['mean', 'std']
        }).reset_index()
        
        # Flatten column names
        summary.columns = [
            'epoch',
            'suffer_mean', 'suffer_std',
            'memory_mean', 'memory_std',
            'identity_mean', 'identity_std',
            'reality_mean', 'reality_std'
        ]
        
        return summary
    
    def get_narrative_events(self) -> Dict[int, str]:
        """
        Map specific epochs to narrative events in the lore.
        
        These are the story beats that happen during training.
        """
        return {
            1: "Day 1: First volunteers receive N8K7. Optimism high.",
            61: "Subject 0447 reports spouse 'feels like a stranger.' Noted as adjustment.",
            150: "Breakthrough moment: Suffer Index averaging 12.3 across population!",
            203: "Ethics review raised concerns. Overruled by Mirro Corporation.",
            300: "First subject unable to recall own name. Attributed to pre-existing condition.",
            447: "Subject 1203 claims to be experiencing three timelines simultaneously.",
            500: "47% of subjects report memory inconsistencies. Deemed 'acceptable.'",
            669: "Reality consensus breakdown detected. Research team debates halting.",
            789: "Dr. Volkov's final log: 'We've eliminated suffering. But what did we eliminate WITH it?'",
            847: "Final epoch. Decision: Deploy globally. The Veil cracks. Reality fragments."
        }

# Generate and save data
if __name__ == "__main__":
    print("Initializing Genesis Protocols...")
    generator = GenesisDataGenerator(n_subjects=10000, n_epochs=847)
    
    print("\nGenerating full experiment data...")
    train_df, val_df = generator.generate_training_data()
    
    print("\nGenerating epoch summaries...")
    summary = generator.generate_epoch_summary()
    
    print("\nSaving datasets...")
    train_df.to_csv('../data/train_data.csv', index=False)
    val_df.to_csv('../data/val_data.csv', index=False)
    summary.to_csv('../data/epoch_summary.csv', index=False)
    
    # Save narrative events
    events = generator.get_narrative_events()
    with open('../data/narrative_events.json', 'w') as f:
        json.dump(events, f, indent=2)
    
    print(f"\n✓ Generated {len(train_df)} training samples")
    print(f"✓ Generated {len(val_df)} validation samples")
    print(f"✓ Generated {len(summary)} epoch summaries")
    print(f"✓ Saved {len(events)} narrative events")
    print("\nGenesis Protocols data ready.")
