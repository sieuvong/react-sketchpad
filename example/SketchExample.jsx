import React, { Component } from "react";
import { find, get, set, findIndex } from "lodash";

export default class SketchExample extends Component {
  constructor(props) {
    super(props);
    const steps = [
      [
        {
          name: "pub",
          imageSrc:
            "https://i.ebayimg.com/images/g/uQcAAOSwiVJbNjJv/s-l400.jpg",
          x: 0,
          y: 0,
          width: 100,
          height: 100
        },
        {
          name: "pub2",
          imageSrc:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQB4OCXuMGD5l5YpNIzW4oBuQfInNzaqr1ryDwhdcLnnoILNFT4g&s",
          x: 150,
          y: 10,
          width: 100,
          height: 100
        }
      ]
    ];
    this.state = {
      steps,
      currentStep: 0,
      frame: 120,
      offsetX: 8,
      offsetY: 58,
      selectingElement: null,
      elements: steps[0].slice()
    };
  }

  componentDidMount() {
    this.init();
  }

  init() {
    this.drawImage();
  }

  drawImage = () => {
    const context = this.canvasRef.getContext("2d");
    this.state.elements.forEach(element => {
      const image = new Image();
      image.src = element.imageSrc;
      image.onload = () => {
        context.drawImage(
          image,
          element.x,
          element.y,
          element.width,
          element.height
        );
      };
    });
  };

  isBelongTo(mouse, object) {
    const { mouseX, mouseY } = mouse;
    const {
      x: objectX,
      y: objectY,
      width: objectWidth,
      height: objectHeight
    } = object;

    if (
      mouseX >= objectX &&
      mouseX <= objectX + objectWidth &&
      mouseY >= objectY &&
      mouseY <= objectY + objectHeight
    ) {
      return true;
    }
    return false;
  }

  onMouseDown = e => {
    const selectingElement = find(this.state.elements, element =>
      this.isBelongTo(
        {
          mouseX: e.pageX - this.state.offsetX,
          mouseY: e.pageY - this.state.offsetY
        },
        element
      )
    );
    this.setState({
      selectingElement
    });
  };

  onMouseUp = e => {
    if (this.state.selectingElement) {
      this.setState({
        selectingElement: null
      });
      const currentStepElements = this.state.elements.slice();
      this.setState(({ currentStep, steps }) => {
        const newCurrentStep = currentStep + 1;
        const newSteps = [...steps, currentStepElements];
        return {
          steps: newSteps,
          currentStep: newCurrentStep,
          elements: currentStepElements
        };
      });
    }
  };

  onMouseOut = e => {
    this.setState({
      selectingElement: null
    });
  };

  onMouseMove = e => {
    const selectingElement = this.state.selectingElement;
    if (selectingElement) {
      const index = findIndex(
        this.state.elements,
        element => element.name === selectingElement.name
      );
      const newElement = {
        ...selectingElement,
        x: e.pageX - this.state.offsetX - selectingElement.width / 2,
        y: e.pageY - this.state.offsetY - selectingElement.height / 2
      };
      const newElements = this.state.elements;
      set(newElements, index, newElement);
      this.setState(
        {
          elements: newElements
        },
        () => {
          this.clearCanvas();
          this.drawImage();
        }
      );
    }
  };

  clearCanvas = () => {
    const context = this.canvasRef.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, this.canvasRef.width, this.canvasRef.height);
  };

  onClickUndo = () => {
    if (this.state.currentStep > 0) {
      this.setState(
        ({ currentStep, steps }) => {
          const newCurrentStep = currentStep - 1;
          return {
            currentStep: newCurrentStep,
            elements: steps[newCurrentStep]
          };
        },
        () => {
          this.clearCanvas();
          this.drawImage();
        }
      );
    }
  };

  onClickRedo = () => {
    if (this.state.currentStep < this.state.steps.length - 1) {
      this.setState(
        ({ currentStep, steps }) => {
          const newCurrentStep = currentStep + 1;
          return {
            currentStep: newCurrentStep,
            elements: steps[newCurrentStep]
          };
        },
        () => {
          this.clearCanvas();
          this.drawImage();
        }
      );
    }
  };

  canvasRef = null;
  render() {
    // const { tool, size, color, fill, fillColor, items } = this.state;
    return (
      <div>
        <div style={{ height: "50px", display: "flex", alignItems: "center" }}>
          <h1>React SketchPad</h1>
          <div>
            Selecting elemenet:{" "}
            {get(this.state.selectingElement, "name") || "none"}
            <img
              id="pug-image"
              style={{ height: "50px", width: "50px" }}
              src={get(this.state.selectingElement, "imageSrc")}
            />
          </div>
          <div>
            <div>Steps: {this.state.steps.length}</div>
            <div>Current: {this.state.currentStep}</div>
          </div>
          <button
            disabled={this.state.currentStep === 0}
            onClick={this.onClickUndo}
          >
            Undo
          </button>
          <button
            disabled={this.state.currentStep === this.state.steps.length - 1}
            onClick={this.onClickRedo}
          >
            Redo
          </button>
        </div>

        <canvas
          ref={ref => {
            this.canvasRef = ref;
          }}
          width="800"
          height="400"
          style={{ border: "1px solid black" }}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onMouseMove={this.onMouseMove}
          onMouseOut={this.onMouseOut}
        />
        {/* <div style={{ float: "left", marginRight: 20 }}>
          <SketchPad
            width={500}
            height={500}
            animate={true}
            size={size}
            color={color}
            fillColor={fill ? fillColor : ""}
            items={items}
            tool={tool}
            onCompleteItem={i => wsClient.emit("addItem", i)}
          />
        </div>
        <div style={{ float: "left" }}>
          <div className="tools" style={{ marginBottom: 20 }}>
            <button
              style={tool == TOOL_PENCIL ? { fontWeight: "bold" } : undefined}
              className={tool == TOOL_PENCIL ? "item-active" : "item"}
              onClick={() => this.setState({ tool: TOOL_PENCIL })}
            >
              Pencil
            </button>
            <button
              style={tool == TOOL_LINE ? { fontWeight: "bold" } : undefined}
              className={tool == TOOL_LINE ? "item-active" : "item"}
              onClick={() => this.setState({ tool: TOOL_LINE })}
            >
              Line
            </button>
            <button
              style={tool == TOOL_ELLIPSE ? { fontWeight: "bold" } : undefined}
              className={tool == TOOL_ELLIPSE ? "item-active" : "item"}
              onClick={() => this.setState({ tool: TOOL_ELLIPSE })}
            >
              Ellipse
            </button>
            <button
              style={
                tool == TOOL_RECTANGLE ? { fontWeight: "bold" } : undefined
              }
              className={tool == TOOL_RECTANGLE ? "item-active" : "item"}
              onClick={() => this.setState({ tool: TOOL_RECTANGLE })}
            >
              Rectangle
            </button>
          </div>
          <div className="options" style={{ marginBottom: 20 }}>
            <label htmlFor="">size: </label>
            <input
              min="1"
              max="20"
              type="range"
              value={size}
              onChange={e => this.setState({ size: parseInt(e.target.value) })}
            />
          </div>
          <div className="options" style={{ marginBottom: 20 }}>
            <label htmlFor="">color: </label>
            <input
              type="color"
              value={color}
              onChange={e => this.setState({ color: e.target.value })}
            />
          </div>
          {this.state.tool == TOOL_ELLIPSE ||
          this.state.tool == TOOL_RECTANGLE ? (
            <div>
              <label htmlFor="">fill in:</label>
              <input
                type="checkbox"
                value={fill}
                style={{ margin: "0 8" }}
                onChange={e => this.setState({ fill: e.target.checked })}
              />
              {fill ? (
                <span>
                  <label htmlFor="">with color:</label>
                  <input
                    type="color"
                    value={fillColor}
                    onChange={e => this.setState({ fillColor: e.target.value })}
                  />
                </span>
              ) : (
                ""
              )}
            </div>
          ) : (
            ""
          )}
        </div> */}
      </div>
    );
  }
}
