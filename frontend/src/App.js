import React, { useState } from "react";
import "./App.css";
import logo from "./logo.png"; // place logo.png inside src/

function App() {
  const [prompt, setPrompt] = useState("");
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [faceSwap, setFaceSwap] = useState(false); // ✅ new toggle state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResultImage(null);

    // ✅ Validation
    if (!faceSwap && !prompt.trim()) {
      setError("Prompt is required unless Face Swap is selected!");
      return;
    }
    if (faceSwap && (!image1 || !image2)) {
      setError("Please upload both Image 1 and Image 2 for Face Swap!");
      return;
    }

    const formData = new FormData();
    formData.append("face_swap", faceSwap); // ✅ send to backend
    if (!faceSwap) formData.append("prompt", prompt);
    if (image1) formData.append("image1", image1);
    if (image2) formData.append("image2", image2);

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Something went wrong");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setResultImage(imageUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement("a");
      link.href = resultImage;
      link.download = "generated_image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      {/* 🔹 Floating logo on top-left */}
      <div className="logo-container">
        <img src={logo} alt="Logo" />
      </div>

      <div className="app-container">
        <h1>AI Image Generator</h1>

        <div className="description">
          <p><strong>1.</strong> Image 1 is the <strong>Source Image</strong> and Image 2 is the <strong>Target Image</strong>.</p>
          <p><strong>2.</strong> Prompts are <strong>mandatory</strong> unless you are performing a <strong>Face Swap</strong>.</p>
          <p><strong>3.</strong> For best results, always upload a <strong>person’s image</strong> in <strong>Image 2</strong>.</p>
          <p><strong>4.</strong> The optional <strong>Face Swap</strong> feature swaps the face from Image 1 onto Image 2.</p>
          <p><strong>5.</strong> Use high-quality, images (JPEG/PNG) for accurate results.</p>
          <p><strong>6.</strong> You can also generate an image using prompts only.</p>
        </div>


        {/* ✅ Face Swap toggle */}
        <div className="toggle-section">
          <label>
            <input
              type="checkbox"
              checked={faceSwap}
              onChange={() => setFaceSwap(!faceSwap)}
            />{" "}
            Enable Face Swap (optional)
          </label>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          {/* 🔸 Prompt input (hidden when faceSwap is true) */}
          {!faceSwap && (
            <>
              <label>Prompt *</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to generate..."
                required={!faceSwap}
              />
            </>
          )}

          {/* 🔸 Image upload */}
          <div className="file-section">
            <div>
              <label>Image 1 {faceSwap ? "(required)" : "(optional)"}</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage1(e.target.files[0])}
                required={faceSwap}
              />
            </div>
            <div>
              <label>Image 2 {faceSwap ? "(required)" : "(optional)"}</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage2(e.target.files[0])}
                required={faceSwap}
              />
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : faceSwap ? "Swap Faces" : "Generate"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {resultImage && (
          <div className="result-section">
            <h3>Result</h3>
            <img src={resultImage} alt="Result" />
            <button className="download-btn" onClick={handleDownload}>
              ⬇️ Download Image
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
