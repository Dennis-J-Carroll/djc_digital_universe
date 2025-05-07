import React, { useState, useEffect } from 'react';
import { StaticQuery, graphql } from 'gatsby';
import styled from 'styled-components';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// Styled components for the notebook viewer
const NotebookContainer = styled.div`
  max-width: 100%;
  margin: 2rem 0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Cell = styled.div`
  margin: 0;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const CodeCell = styled(Cell)`
  background-color: #f8f8f8;
`;

const MarkdownCell = styled(Cell)`
  background-color: white;
`;

const OutputCell = styled(Cell)`
  background-color: #fafafa;
  max-height: 400px;
  overflow-y: auto;
`;

const CellNumber = styled.div`
  color: #767676;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
`;

const OutputImage = styled.img`
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
`;

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
    <NotebookContainer>
      {notebook.cells.map((cell, index) => {
        if (cell.cell_type === "markdown") {
          return (
            <MarkdownCell key={index}>
              <div dangerouslySetInnerHTML={{ __html: cell.source.join("") }} />
            </MarkdownCell>
          );
        } else if (cell.cell_type === "code") {
          return (
            <React.Fragment key={index}>
              <CodeCell>
                <CellNumber>In [{cell.execution_count || ' '}]:</CellNumber>
                <SyntaxHighlighter language="python" style={atomOneDark}>
                  {cell.source.join("")}
                </SyntaxHighlighter>
              </CodeCell>
              
              {cell.outputs && cell.outputs.length > 0 && (
                <OutputCell>
                  <CellNumber>Out [{cell.execution_count || ' '}]:</CellNumber>
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
                            <OutputImage 
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
                </OutputCell>
              )}
            </React.Fragment>
          );
        }
        return null;
      })}
    </NotebookContainer>
  );
};

export default JupyterViewer;

// Usage example:
// <JupyterViewer notebookPath="/path/to/notebook.ipynb" />
