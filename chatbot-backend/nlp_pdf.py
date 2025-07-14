
import spacy
import joblib
from fpdf import FPDF
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import os

# === Load spaCy language model ===
nlp = spacy.load("en_core_web_sm")

# === Text Preprocessing ===
def preprocess_text(text):
    doc = nlp(str(text).lower())
    return " ".join([t.lemma_ for t in doc if not t.is_stop and not t.is_punct])

# === Train and Save Model ===
def train_and_save_model():
    dataset_path = "complete_complaints_dataset.csv"

    # ✅ Ensure file exists
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"❌ Dataset not found at: {dataset_path}")

    df = pd.read_csv(dataset_path)

    # ✅ Ensure necessary columns exist
    if "Complaint Description" not in df.columns or "Category" not in df.columns:
        raise ValueError("❌ CSV must contain 'Complaint Description' and 'Category' columns.")

    # ✅ Preprocess complaints
    df["Processed"] = df["Complaint Description"].apply(preprocess_text)

    # ✅ Create and train pipeline
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer()),
        ("clf", LogisticRegression(max_iter=1000))
    ])
    pipeline.fit(df["Processed"], df["Category"])

    # ✅ Save the model
    joblib.dump(pipeline, "model.joblib")
    print("✅ Model trained and saved as model.joblib")

# === Load Saved Model ===
def load_trained_model():
    return joblib.load("model.joblib")

# === Summary, Impact & Recommendation Generator ===
def generate_clean_content(category):
    summary = f"The complaint suggests a case of {category}. Such cases can lead to serious consequences."

    default_impact = [
        "Financial loss",
        "Unauthorized access to personal information",
        "Legal implications"
    ]

    default_recommendations = [
        "Report the incident to the relevant authorities.",
        "Change passwords and enable two-factor authentication.",
        "Stay cautious and educate others about similar threats."
    ]

    # Optional: Expand this dictionary with more categories later
    impact = {
        "Financial Fraud": [
            "Financial loss",
            "Unauthorized bank transactions",
            "Identity theft"
        ],
        "Online Harassment": [
            "Emotional distress",
            "Reputational damage",
            "Legal consequences"
        ],
        "Cyberstalking": [
            "Invasion of privacy",
            "Constant fear or anxiety",
            "Safety threats"
        ]
    }.get(category, default_impact)

    recommendations = {
        "Financial Fraud": [
            "Contact your bank immediately.",
            "Report the fraud on the cybercrime portal.",
            "Keep records of all fraudulent transactions."
        ],
        "Online Harassment": [
            "Block and report the harasser on the platform.",
            "Save screenshots and chat logs.",
            "File a complaint with the cyber cell."
        ],
        "Cyberstalking": [
            "Do not engage with the stalker.",
            "Inform close contacts and change passwords.",
            "File a police report with all records."
        ]
    }.get(category, default_recommendations)

    return summary, impact, recommendations

# === PDF Report Generator ===
def create_pdf_report(info, category, filename):
    summary, impact_list, recommendation_list = generate_clean_content(category)

    def safe_text(text):
        return text.encode('latin-1', 'replace').decode('latin-1')

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(0, 10, "Cybercrime Complaint Report", ln=1, align='C')

    # Details
    pdf.ln(5)
    pdf.set_font("Arial", '', 12)
    pdf.multi_cell(0, 8, safe_text(
        f"Name: {info['name']}\nEmail: {info['email']}\nDate & Time: {info['date']} {info['time']}\nLocation: {info['location']}"
    ))

    # Description
    pdf.ln(3)
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, "Complaint Description:", ln=1)
    pdf.set_font("Arial", '', 12)
    pdf.multi_cell(0, 8, safe_text(info['complaint']))

    # Prediction
    pdf.ln(3)
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, f"Predicted Category: {safe_text(category)}", ln=1)

    # Summary
    pdf.set_font("Arial", '', 12)
    pdf.multi_cell(0, 10, "Incident Summary:")
    pdf.multi_cell(0, 10, safe_text(summary) + "\n")

    # Impact
    pdf.multi_cell(0, 10, "Possible Impact:")
    for item in impact_list:
        pdf.cell(0, 10, f"- {safe_text(item)}", ln=True)

    # Recommendations
    pdf.multi_cell(0, 10, "\nRecommended Actions:")
    for action in recommendation_list:
        pdf.cell(0, 10, f"- {safe_text(action)}", ln=True)

    pdf.output(filename)
    print(f"✅ PDF generated: {filename}")

# === Run training if executed directly ===
if __name__ == "__main__":
    train_and_save_model()
