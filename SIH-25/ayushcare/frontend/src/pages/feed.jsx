import React from "react";
import "./feed.css";

const sessions = [
  {
    title: "Vamana (Therapeutic Emesis)",
    questions: [
      { label: "How comfortable did you feel during the Vamana therapy?", type: "scale" },
      { label: "Did the therapist explain the procedure clearly before starting?", type: "yesno" },
      { label: "Did you experience any relief or improvement post-therapy?", type: "yesno" },
      { label: "How satisfied are you with the hygiene and cleanliness of the therapy area?", type: "scale" },
      { label: "Any discomfort or suggestions regarding this therapy?", type: "text" },
    ]
  },
  {
    title: "Virechana (Purgation Therapy)",
    questions: [
      { label: "Were the pre-procedure instructions easy to follow?", type: "yesno" },
      { label: "How would you rate your overall experience during Virechana?", type: "scale" },
      { label: "Did you face any discomfort or uneasiness after the therapy?", type: "yesno" },
      { label: "Was the therapist attentive and supportive throughout the procedure?", type: "scale" },
      { label: "Any additional comments or suggestions for improvement?", type: "text" },
    ]
  },
  {
    title: "Basti (Medicated Enema)",
    questions: [
      { label: "Was the environment comfortable and private during Basti therapy?", type: "scale" },
      { label: "Did the procedure provide expected relief or improvement?", type: "yesno" },
      { label: "How professional and caring was the therapist during the therapy?", type: "scale" },
      { label: "Were the post-therapy care instructions clear and easy to follow?", type: "yesno" },
      { label: "Any suggestions for making your experience better?", type: "text" },
    ]
  },
  {
    title: "Nasya (Nasal Therapy)",
    questions: [
      { label: "Did you feel relaxed and comfortable during the Nasya procedure?", type: "scale" },
      { label: "Was the process explained clearly by the therapist?", type: "yesno" },
      { label: "Did you notice improvement in your symptoms post-therapy?", type: "yesno" },
      { label: "Rate the hygiene and atmosphere of the treatment area.", type: "scale" },
      { label: "Any remarks or suggestions about this session?", type: "text" },
    ]
  },
  {
    title: "Raktamokshana (Bloodletting Therapy)",
    questions: [
      { label: "How would you rate your confidence in the safety of this procedure?", type: "scale" },
      { label: "Did you feel minimal discomfort during the process?", type: "yesno" },
      { label: "Was the therapist professional and well-prepared?", type: "scale" },
      { label: "Did you experience positive results after therapy?", type: "yesno" },
      { label: "Please share your feedback or suggestions for improvement.", type: "text" },
    ]
  }
];

/* RENDER QUESTION FUNCTION WITH FOCUS + UNDERLINE ANIMATION */
function renderQuestion(q, idx, setFocus, focusedIndex) {
  return (
    <div
      key={idx}
      className={`feedback-question ${focusedIndex === idx ? "focused" : ""}`}
    >
      {/* Question Number + Label */}
      <label className="question-label">
        {idx + 1}. {q.label}
      </label>

      {q.type === "scale" && (
        <div className="rating-row">
          {[1, 2, 3, 4, 5].map((val) => (
            <label key={val}>
              <input
                type="radio"
                name={q.label}
                value={val}
                onFocus={() => setFocus(idx)}
              />{" "}
              {val}
            </label>
          ))}
        </div>
      )}

      {q.type === "yesno" && (
        <div className="rating-row">
          <label>
            <input
              type="radio"
              name={q.label}
              value="yes"
              onFocus={() => setFocus(idx)}
            />{" "}
            Yes
          </label>

          <label>
            <input
              type="radio"
              name={q.label}
              value="no"
              onFocus={() => setFocus(idx)}
            />{" "}
            No
          </label>
        </div>
      )}

      {q.type === "text" && (
        <textarea
          className="feedback-textarea"
          rows="2"
          onFocus={() => setFocus(idx)}
        ></textarea>
      )}
    </div>
  );
}


export default function FeedbackPage() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [focusedIndex, setFocusedIndex] = React.useState(null);

  return (
    <div className="feedback-root">
      <div className="feedback-wrapper">
        <h1 className="main-title">Therapy Feedback</h1>

        <div className="feedback-layout">
          {/* LEFT SIDE - TABS */}
          <div className="therapy-tabs">
            {sessions.map((session, index) => (
              <button
                key={index}
                className={`tab-btn ${activeTab === index ? "active" : ""}`}
                onClick={() => setActiveTab(index)}
              >
                {session.title.split(" (")[0]} {/* Show short name */}
              </button>
            ))}
          </div>

          {/* RIGHT SIDE - FORM CONTENT */}
          <div className="feedback-content-card">
            <h2 className="session-header">{sessions[activeTab].title}</h2>

            <div className="questions-list">
              {sessions[activeTab].questions.map((q, idx) =>
                renderQuestion(q, idx, setFocusedIndex, focusedIndex)
              )}
            </div>

            <button className="feedback-submit">
              Submit {sessions[activeTab].title.split(" ")[0]} Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}