import React, { useState, useEffect } from 'react';
import { StaticQuery, graphql } from 'gatsby';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './jupyter-viewer.css';

/**
 * JupyterViewer component renders Jupyter notebooks stored as JSON
 * 
 * @param {string} notebookPath - Path to the notebook JSON file
 */
const JupyterViewer = ({ notebookPath }) => {
  const [notebook, setNotebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // In a real implementation, you would fetch the notebook JSON
  // For this POC, we'll use a mock notebook structure
  useEffect(() => {
    // Simulating fetch of notebook data
    setTimeout(() => {
      // This would normally be the result of a fetch operation
      const mockNotebook = {
        cells: [
          {
            cell_type: "markdown",
            source: [
              "# Sample Jupyter Notebook\n",
              "\n",
              "This is a sample notebook for demonstration purposes."
            ]
          },
          {
            cell_type: "code",
            execution_count: 1,
            source: [
              "import pandas as pd\n",
              "import matplotlib.pyplot as plt\n",
              "import numpy as np\n",
              "\n",
              "# Create some sample data\n",
              "df = pd.DataFrame({\n",
              "    'x': np.random.randn(100),\n",
              "    'y': np.random.randn(100)\n",
              "})"
            ],
            outputs: []
          },
          {
            cell_type: "code",
            execution_count: 2,
            source: [
              "# Create a scatter plot\n",
              "plt.figure(figsize=(10, 6))\n",
              "plt.scatter(df['x'], df['y'])\n",
              "plt.title('Sample Scatter Plot')\n",
              "plt.xlabel('X values')\n",
              "plt.ylabel('Y values')\n",
              "plt.grid(True)\n",
              "plt.show()"
            ],
            outputs: [
              {
                output_type: "display_data",
                data: {
                  "image/png": "base64encodedimagewouldgohere",
                  "text/plain": "<Figure size 1000x600 with 1 Axes>"
                },
                metadata: {}
              }
            ]
          },
          {
            cell_type: "code",
            execution_count: 3,
            source: [
              "# Calculate correlation\n",
              "correlation = df['x'].corr(df['y'])\n",
              "print(f'Correlation between x and y: {correlation:.4f}')"
            ],
            outputs: [
              {
                output_type: "stream",
                name: "stdout",
                text: ["Correlation between x and y: 0.0237"]
              }
            ]
          }
        ],
        metadata: {
          kernelspec: {
            display_name: "Python 3",
            language: "python",
            name: "python3"
          }
        }
      };
      
      setNotebook(mockNotebook);
      setLoading(false);
    }, 1000);
  }, [notebookPath]);

  if (loading) {
    return <div>Loading notebook...</div>;
  }

  if (error) {
    return <div>Error loading notebook: {error}</div>;
  }

  if (!notebook) {
    return <div>No notebook data available.</div>;
  }

  // Render the notebook
  return (
    <div className="notebook-container">
      {notebook.cells.map((cell, index) => {
        if (cell.cell_type === "markdown") {
          return (
            <div key={index} className="notebook-cell notebook-cell-markdown">
              <div dangerouslySetInnerHTML={{ __html: cell.source.join("") }} />
            </div>
          );
        } else if (cell.cell_type === "code") {
          return (
            <React.Fragment key={index}>
              <div className="notebook-cell notebook-cell-code">
                <div className="notebook-cell-number">In [{cell.execution_count || ' '}]:</div>
                <SyntaxHighlighter language="python" style={atomOneDark}>
                  {cell.source.join("")}
                </SyntaxHighlighter>
              </div>

              {cell.outputs && cell.outputs.length > 0 && (
                <div className="notebook-cell notebook-cell-output">
                  <div className="notebook-cell-number">Out [{cell.execution_count || ' '}]:</div>
                  {cell.outputs.map((output, outputIndex) => {
                    if (output.output_type === "stream") {
                      return (
                        <pre key={outputIndex}>
                          {output.text.join("")}
                        </pre>
                      );
                    } else if (output.output_type === "display_data") {
                      // In a real implementation, you would render the image from base64
                      return (
                        <div key={outputIndex}>
                          {output.data["image/png"] && (
                            <img
                              className="notebook-output-image"
                              src={`data:image/png;base64,${output.data["image/png"]}`}
                              alt="Notebook output"
                            />
                          )}
                          {output.data["text/plain"] && (
                            <pre>{output.data["text/plain"]}</pre>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </React.Fragment>
          );
        }
        return null;
      })}
    </div>
  );
};

export default JupyterViewer;

// Usage example:
// <JupyterViewer notebookPath="/path/to/notebook.ipynb" />
