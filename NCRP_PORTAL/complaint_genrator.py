import pandas as pd
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
from fpdf import FPDF

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

def preprocess_text(text):
    doc = nlp(str(text).lower())
    return " ".join([token.lemma_ for token in doc if not token.is_stop and not token.is_punct])

def train_model(df):
    df["Processed_Complaint"] = df["Complaint Description"].apply(preprocess_text)
    X = df["Processed_Complaint"]
    y = df["Category"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer()),
        ("clf", LogisticRegression(max_iter=1000))
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    print("Model trained. Classification report:")
    print(classification_report(y_test, y_pred))
    return pipeline

def generate_clean_content(category, sub_category):
    summary = f"The complaint suggests a case of {category}, particularly {sub_category}. Such cases can lead to serious consequences."

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
        ],
    }.get(category, [
        "Financial loss",
        "Unauthorized access to personal information",
        "Legal implications"
    ])

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
        ],
    }.get(category, [
        "Report the incident to the relevant authorities.",
        "Change passwords and enable two-factor authentication.",
        "Stay cautious and educate others about similar threats."
    ])

    return summary, impact, recommendations

def create_pdf_report(complaint_text, category, sub_category, filename="cybercrime_report.pdf"):
    summary, impact_list, recommendation_list = generate_clean_content(category, sub_category)

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "Cybercrime Complaint Report", ln=True)
    pdf.set_font("Arial", "", 12)
    pdf.cell(0, 10, "-" * 50, ln=True)

    pdf.multi_cell(0, 10, f"Complaint:\n{complaint_text}\n")
    pdf.multi_cell(0, 10, f"Predicted Category: {category}\nSub-Category: {sub_category}\n")
    pdf.multi_cell(0, 10, "Incident Summary:")
    pdf.multi_cell(0, 10, summary + "\n")

    pdf.multi_cell(0, 10, "Possible Impact:")
    for item in impact_list:
        pdf.cell(0, 10, f"- {item}", ln=True)

    pdf.multi_cell(0, 10, "\nRecommended Actions:")
    for action in recommendation_list:
        pdf.cell(0, 10, f"- {action}", ln=True)

    pdf.multi_cell(0, 10, "\nAdditional Information Needed:")
    pdf.cell(0, 10, "- Were any personal details shared?", ln=True)
    pdf.cell(0, 10, "- Have there been similar past incidents?", ln=True)
    pdf.cell(0, 10, "- Was any monetary loss involved?", ln=True)

    pdf.multi_cell(0, 10, "\nManual Complaint Submission:")
    pdf.multi_cell(0, 10, "If the victim wishes to file a manual complaint, they should visit the cybercrime portal or nearest police station with all relevant details, including screenshots, transaction records, and communications.")

    pdf.output(filename)
    print(f"PDF report saved to {filename}")

if __name__ == "__main__":
    # Load your dataset
    df = pd.read_csv("complete_complaints_dataset.csv")  # Replace with your dataset path
    model = train_model(df)

    complaint = input("Enter the complaint: ")
    processed = preprocess_text(complaint)
    category = model.predict([processed])[0]
    sub_category = "General"  # You can plug in your sub-category prediction here

    create_pdf_report(complaint, category, sub_category)
