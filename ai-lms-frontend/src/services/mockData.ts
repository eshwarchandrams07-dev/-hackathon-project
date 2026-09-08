import { Course } from '../types';

export const SAMPLE_COURSE: Course = {
  course_title: "Neural Networks & Deep Learning Foundations",
  overview: "An interactive, foundational curriculum exploring artificial neurons, gradient descent optimization, backpropagation mechanics, and modern transformer architectures extracted from state-of-the-art textbook notes.",
  modules: [
    {
      module_id: "mod_1",
      title: "Biological Foundations to Artificial Neurons",
      description: "Explore how biological neuronal pathways inspired computational perceptrons and activation functions.",
      concept_nodes: [
        {
          node_id: "perceptron",
          label: "Single-Layer Perceptron",
          dependencies: []
        },
        {
          node_id: "activation_functions",
          label: "Nonlinear Activations (ReLU, Sigmoid)",
          dependencies: ["perceptron"]
        },
        {
          node_id: "loss_functions",
          label: "Loss & Cost Objectives",
          dependencies: ["perceptron"]
        },
        {
          node_id: "gradient_descent",
          label: "Stochastic Gradient Descent",
          dependencies: ["loss_functions", "activation_functions"]
        }
      ],
      lessons: [
        {
          lesson_id: "les_1_1",
          title: "The Perceptron: The Atomic Unit of Deep Learning",
          summary: "Understand the mathematical model of the single-layer perceptron, weighted summation, bias terms, and decision boundaries.",
          content_markdown: `### What is a Perceptron?

Introduced by Frank Rosenblatt in 1958, the **Perceptron** is the simplest mathematical model of an artificial neuron. It takes multiple inputs, computes a weighted sum with an added bias, and passes the result through an activation function to produce an output.

$$\\hat{y} = f\\left(\\sum_{i=1}^{n} w_i x_i + b\\right)$$

#### Key Architectural Components:
1. **Inputs ($x_1, x_2, \\dots, x_n$)**: Features describing the sample (e.g., pixel intensities, normalized sensor readings).
2. **Weights ($w_1, w_2, \\dots, w_n$)**: Parameters dictating the relative importance or influence of each feature.
3. **Bias ($b$)**: An offset term that shifts the activation boundary independently of the inputs, allowing non-zero thresholds.
4. **Activation Function ($f$)**: Determines whether the neuron fires and introduces non-linearity.

\`\`\`python
def perceptron_forward(inputs, weights, bias):
    # Calculate dot product of inputs and weights
    linear_combination = sum(x * w for x, w in zip(inputs, weights)) + bias
    # Step activation function
    return 1 if linear_combination >= 0 else 0
\`\`\`

> **Socratic Insight**: If all inputs were zero ($x_i = 0$), what alone determines whether the neuron activates? *The bias term $b$.* This demonstrates why bias is necessary for flexible decision boundaries!

#### The Linear Separability Limitation
Single-layer perceptrons can only classify data that is **linearly separable** (meaning a straight hyperplane can divide the classes). They famously failed on the **XOR (Exclusive OR) Problem**, which stalled AI research until multi-layer networks and backpropagation were discovered.`,
          key_takeaways: [
            "Perceptrons compute a linear combination: z = w·x + b before applying an activation threshold.",
            "Bias shifts the decision threshold away from the origin.",
            "Single perceptrons can only solve linearly separable problems (cannot solve XOR without hidden layers)."
          ],
          quiz: [
            {
              id: "q1_1",
              question: "Why is a bias term mathematically essential in an artificial neuron?",
              options: [
                "It accelerates floating point multiplication on GPUs",
                "It shifts the activation boundary away from the origin when inputs are zero",
                "It guarantees the weights will never become negative",
                "It converts linear equations into quadratic equations"
              ],
              correct_answer: "It shifts the activation boundary away from the origin when inputs are zero",
              hint: "Consider what happens to the output if all input feature values x are 0. Can the neuron output anything other than 0 without a bias?",
              difficulty: "Easy"
            },
            {
              id: "q1_2",
              question: "Which fundamental logical function cannot be solved by a single-layer perceptron?",
              options: [
                "AND gate",
                "OR gate",
                "XOR (Exclusive OR) gate",
                "NOT gate"
              ],
              correct_answer: "XOR (Exclusive OR) gate",
              hint: "Think about drawing a single straight line through a 2D plot of inputs (0,0), (0,1), (1,0), (1,1). Which pattern cannot be split by one line?",
              difficulty: "Medium"
            }
          ]
        },
        {
          lesson_id: "les_1_2",
          title: "Activation Functions: Introducing Non-Linearity",
          summary: "Compare Sigmoid, Tanh, and ReLU. Understand why stacking purely linear layers collapses mathematically into a single linear transformation.",
          content_markdown: `### Why Do We Need Non-Linear Activations?

A neural network without activation functions is simply a chain of matrix multiplications:

$$\\hat{y} = W_3(W_2(W_1 x + b_1) + b_2) + b_3 = W_{effective} x + b_{effective}$$

No matter how many millions of layers you stack, a deep linear network can **never** model non-linear phenomena such as curves, language syntax, or image textures.

#### Common Activation Functions:

1. **Sigmoid $\\sigma(z)$**:
   $$\\sigma(z) = \\frac{1}{1 + e^{-z}}$$
   - *Range*: $(0, 1)$
   - *Use*: Binary classification output layer.
   - *Drawback*: Vanishing gradient problem for very large or small inputs ($z$).

2. **Hyperbolic Tangent (Tanh)**:
   $$\\tanh(z) = \\frac{e^z - e^{-z}}{e^z + e^{-z}}$$
   - *Range*: $(-1, 1)$
   - *Advantage*: Zero-centered outputs make gradient updates less oscillating.

3. **Rectified Linear Unit (ReLU)**:
   $$f(z) = \\max(0, z)$$
   - *Range*: $[0, \\infty)$
   - *Advantage*: Extremely fast to compute, does not saturate in positive region, drastically speeds up convergence.`,
          key_takeaways: [
            "Without non-linear activations, multi-layer networks collapse mathematically to a single linear layer.",
            "Sigmoid maps real values into (0, 1), but suffers from vanishing gradients.",
            "ReLU (max(0, z)) is the modern standard for hidden layers due to computational efficiency and non-saturating gradients."
          ],
          quiz: [
            {
              id: "q2_1",
              question: "What happens if you build a 50-layer deep neural network using only linear transformations without activation functions?",
              options: [
                "The network will overfit immediately",
                "It functions identically to a single-layer linear model",
                "Gradients will explode to infinity on the first epoch",
                "The output becomes non-deterministic"
              ],
              correct_answer: "It functions identically to a single-layer linear model",
              hint: "Remember matrix associativity: W2 * (W1 * x) = (W2 * W1) * x = W_combined * x.",
              difficulty: "Medium"
            }
          ]
        }
      ]
    },
    {
      module_id: "mod_2",
      title: "Optimization & The Backpropagation Algorithm",
      description: "Master loss minimization, the multivariate chain rule, and stochastic gradient descent dynamics.",
      concept_nodes: [
        {
          node_id: "chain_rule",
          label: "Multivariate Calculus Chain Rule",
          dependencies: []
        },
        {
          node_id: "backprop",
          label: "Backpropagation Mechanics",
          dependencies: ["chain_rule"]
        },
        {
          node_id: "learning_rate",
          label: "Learning Rate Scheduling & Momentum",
          dependencies: ["backprop"]
        }
      ],
      lessons: [
        {
          lesson_id: "les_2_1",
          title: "Backpropagation: Applying the Chain Rule at Scale",
          summary: "Discover how error gradients flow backwards from the output loss to earlier hidden weights to guide updates.",
          content_markdown: `### The Core Intuition of Backpropagation

Backpropagation is an efficient implementation of the **calculus chain rule** for calculating the gradient of a loss function $L$ with respect to every weight $w_{ij}$ in the network.

$$\\frac{\\partial L}{\\partial w_{ij}} = \\frac{\\partial L}{\\partial y} \\cdot \\frac{\\partial y}{\\partial z} \\cdot \\frac{\\partial z}{\\partial w_{ij}}$$

#### The Two-Pass Cycle:
1. **Forward Pass**: The input data flows forward through the layers. Each layer calculates its activations until the loss $L(y, \\hat{y})$ is computed at the output.
2. **Backward Pass**: Starting from the final loss, gradients are propagated backwards using intermediate cached activations to compute weight updates:

$$w_{new} = w_{old} - \\eta \\cdot \\frac{\\partial L}{\\partial w}$$

where $\\eta$ is the **learning rate**.

> **Socratic Question to Ponder**: If the learning rate $\\eta$ is set too large, what physical behavior do you observe in the loss landscape? If it's too small, what is the penalty?`,
          key_takeaways: [
            "Backpropagation reuses intermediate computations during the backward pass to compute gradients in O(W) time.",
            "Weight updates follow the negative gradient direction scaled by learning rate eta.",
            "Careful cache management during the forward pass is crucial for backward memory efficiency."
          ],
          quiz: [
            {
              id: "q3_1",
              question: "What mathematical tool allows gradients to be systematically computed from output layers back to input layers?",
              options: [
                "The Multivariate Chain Rule",
                "Laplace Transformation",
                "Euler-Lagrange Formula",
                "Fourier Spectral Analysis"
              ],
              correct_answer: "The Multivariate Chain Rule",
              hint: "How do you take the derivative of a composite function f(g(x)) with respect to x?",
              difficulty: "Hard"
            }
          ]
        }
      ]
    }
  ]
};

export const INITIAL_SOCRATIC_MESSAGES = [
  {
    id: "welcome-tutor",
    role: "assistant" as const,
    content: "Greetings! I am your Socratic AI Tutor. Rather than just handing you answers, I am here to guide your thinking, ask probing questions, and clarify concepts directly from your textbook context.\n\nTake a look at the active lesson on the left. What questions or curiosities come to mind?",
    timestamp: Date.now() - 36000,
    citations: [1]
  }
];
