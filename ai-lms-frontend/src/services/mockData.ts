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

export const OS_SCHEDULING_COURSE: Course = {
  course_title: "Operating System Scheduling Algorithms",
  overview: "An in-depth exploration of fundamental CPU scheduling algorithms: First-Come First-Served (FCFS), Non-Preemptive Shortest Job First (SJF), and Preemptive SJF / Shortest Remaining Time First (SRTF).",
  modules: [
    {
      module_id: "mod_1_fcfs",
      title: "M1 FCFS Scheduling Implementation",
      description: "First-Come First-Served scheduling mechanics, Gantt chart calculation, and the Convoy Effect.",
      concept_nodes: [
        {
          node_id: "fcfs_queue",
          label: "FCFS Queue Order",
          dependencies: []
        },
        {
          node_id: "convoy_effect",
          label: "Convoy Effect",
          dependencies: ["fcfs_queue"]
        }
      ],
      lessons: [
        {
          lesson_id: "les_1_1_fcfs",
          title: "1.1 FCFS Logic and Calculation",
          summary: "Explore First-Come, First-Served queue traversal, waiting time formulas, and performance degradation under large CPU bursts.",
          content_markdown: `### 1.1 FCFS Logic and Calculation

#### What is First-Come, First-Served (FCFS)?
First-Come, First-Served (FCFS) is the simplest non-preemptive CPU scheduling algorithm. Processes are dispatched strictly in the order they arrive in the ready queue (FIFO discipline).

#### Execution Mechanics & Formulas:
1. **Queue Traversal**: The first process in the ready queue is assigned the CPU until completion or I/O request.
2. **Waiting Time ($WT$)**:
   - $WT[0] = 0$ (first process has zero wait)
   - $WT[i] = WT[i-1] + BT[i-1]$ (sum of all preceding CPU bursts)
3. **Turnaround Time ($TAT$)**:
   - $TAT[i] = Burst\\_Time[i] + Waiting\\_Time[i]$
4. **Average Waiting Time**:
   - $Avg\\_WT = \\frac{\\sum WT[i]}{N}$

#### The Convoy Effect:
When a heavy CPU-bound process with a huge burst arrives first, all subsequent short I/O-bound jobs are blocked behind it. This phenomenon is known as the **Convoy Effect**, resulting in poor overall throughput and sluggish interactive response times.`,
          key_takeaways: [
            "FCFS operates as a non-preemptive FIFO queue.",
            "Waiting Time is calculated cumulatively from previous process burst times.",
            "The Convoy Effect occurs when long burst processes delay short interactive processes."
          ],
          quiz: [
            {
              id: "q_fcfs_1",
              question: "In First-Come, First-Served (FCFS) scheduling, what is the primary consequence of a CPU-bound process arriving before multiple I/O-bound processes?",
              options: [
                "The Convoy Effect, causing significant delays for shorter processes",
                "Deadlock due to circular wait in the ready queue",
                "Priority inversion in the scheduler interrupt handler",
                "Immediate preemption of the running task"
              ],
              correct_answer: "The Convoy Effect, causing significant delays for shorter processes",
              hint: "Think about short jobs getting stuck behind a single massive job.",
              difficulty: "Easy"
            },
            {
              id: "q_fcfs_2",
              question: "If processes P1 (Burst 10ms) and P2 (Burst 3ms) arrive at time 0 in that order under FCFS, what is the waiting time of P2?",
              options: [
                "10 ms",
                "3 ms",
                "13 ms",
                "0 ms"
              ],
              correct_answer: "10 ms",
              hint: "P1 runs from time 0 to 10ms. P2 must wait until P1 finishes.",
              difficulty: "Medium"
            }
          ]
        }
      ]
    },
    {
      module_id: "mod_2_sjf",
      title: "M2 SJF Non-Preemptive Scheduling",
      description: "Shortest Job First non-preemptive algorithm, burst time prioritization, and minimum average waiting time.",
      concept_nodes: [
        {
          node_id: "sjf_burst",
          label: "Burst Time Comparison",
          dependencies: []
        },
        {
          node_id: "starvation",
          label: "Starvation & Aging",
          dependencies: ["sjf_burst"]
        }
      ],
      lessons: [
        {
          lesson_id: "les_2_1_sjf",
          title: "2.1 Non-Preemptive SJF Algorithm",
          summary: "Understand why SJF is provably optimal for minimizing average waiting time, and analyze the starvation dilemma for long jobs.",
          content_markdown: `### 2.1 Non-Preemptive SJF Algorithm

#### Shortest Job First (SJF) Principles
In Shortest Job First (SJF) scheduling, the scheduler selects the process with the shortest anticipated CPU burst time from the ready queue. When the CPU becomes free, the shortest task is dispatched and runs to completion without interruption.

#### Provable Optimality
Non-preemptive SJF is provably optimal for minimizing the overall average waiting time for a given set of processes. Mathematically, running shorter jobs first diminishes the cumulative waiting time experienced across all queued tasks.

#### Starvation & Practical Challenges:
1. **Burst Length Prediction**: The operating system cannot know with certainty how long a user process will calculate before making a system call. Burst times must typically be estimated using exponential smoothing:
   $$\\tau_{n+1} = \\alpha t_n + (1 - \\alpha)\\tau_n$$
2. **Starvation**: If short jobs continuously arrive in the ready queue, long CPU-bound jobs may never receive execution time.`,
          key_takeaways: [
            "SJF selects the process with the smallest CPU burst time.",
            "Provably optimal for minimizing overall average waiting time.",
            "Long processes risk starvation if short jobs arrive continually."
          ],
          quiz: [
            {
              id: "q_sjf_1",
              question: "Why is Non-Preemptive Shortest Job First (SJF) considered mathematically optimal?",
              options: [
                "It minimizes the overall average waiting time across all processes",
                "It guarantees zero context switching overhead",
                "It prioritizes processes based on memory allocation size",
                "It prevents CPU idle cycles completely"
              ],
              correct_answer: "It minimizes the overall average waiting time across all processes",
              hint: "Running the shortest jobs first rapidly clears them from the queue.",
              difficulty: "Easy"
            },
            {
              id: "q_sjf_2",
              question: "What is the main obstacle to implementing pure SJF in real general-purpose operating systems?",
              options: [
                "The future CPU burst length of a process cannot be known with certainty in advance",
                "It requires hardware floating-point registers",
                "It can only manage up to 4 concurrent processes",
                "It disables timer interrupts"
              ],
              correct_answer: "The future CPU burst length of a process cannot be known with certainty in advance",
              hint: "How can the scheduler know how long a program will calculate before doing I/O?",
              difficulty: "Medium"
            }
          ]
        }
      ]
    },
    {
      module_id: "mod_3_srtf",
      title: "M3 SJF Preemptive (SRTF) Logic",
      description: "Shortest Remaining Time First (SRTF), preemption criteria, and sorting by remaining burst.",
      concept_nodes: [
        {
          node_id: "srtf_logic",
          label: "Remaining Time Evaluation",
          dependencies: []
        },
        {
          node_id: "context_switch",
          label: "Context Switch Overhead",
          dependencies: ["srtf_logic"]
        }
      ],
      lessons: [
        {
          lesson_id: "les_3_1_srtf",
          title: "3.1 Preemptive SJF via Sorting",
          summary: "Examine Shortest Remaining Time First (SRTF) mechanics, preemption thresholds, and context switch costs.",
          content_markdown: `### 3.1 Preemptive SJF (SRTF) Logic

#### Preemptive Shortest Job First (SRTF)
Shortest Remaining Time First (SRTF) is the preemptive variant of SJF. Whenever a new process arrives at the ready queue, the scheduler compares its required burst time against the **remaining burst time** of the currently executing process.

#### Preemption Condition:
If:
$$\\text{Burst Time}(\\text{New Process}) < \\text{Remaining Time}(\\text{Current Process})$$
Then:
1. The currently executing process is interrupted (preempted) and moved back to the ready queue.
2. Its process control block (PCB) and registers are saved during a context switch.
3. The new process with the shorter remaining time is dispatched to the CPU.

#### Trade-offs:
- **Advantage**: Provides even shorter average waiting times and significantly better response time for urgent short jobs.
- **Disadvantage**: Incurs significant context switching overhead and heightened risk of process starvation.`,
          key_takeaways: [
            "SRTF compares incoming bursts against the active process's remaining execution time.",
            "Preempts the running job if a newcomer can complete sooner.",
            "Yields superior responsiveness but incurs higher context switching overhead."
          ],
          quiz: [
            {
              id: "q_srtf_1",
              question: "When does preemption occur in Shortest Remaining Time First (SRTF) scheduling?",
              options: [
                "When a newly arrived process has a burst time strictly less than the remaining time of the current process",
                "When the process voluntarily yields CPU control to disk I/O",
                "When the maximum time slice quantum expires",
                "Only when user sends a kill interrupt signal"
              ],
              correct_answer: "When a newly arrived process has a burst time strictly less than the remaining time of the current process",
              hint: "Preemption is triggered if a newly arrived process can finish faster than the remaining time of the current job.",
              difficulty: "Medium"
            },
            {
              id: "q_srtf_2",
              question: "What primary operational trade-off distinguishes Preemptive SJF (SRTF) from Non-Preemptive SJF?",
              options: [
                "SRTF yields lower average waiting time but incurs more context switching overhead",
                "SRTF eliminates starvation completely",
                "SRTF disables hardware interrupts during execution",
                "SRTF cannot handle more than one process in the ready queue"
              ],
              correct_answer: "SRTF yields lower average waiting time but incurs more context switching overhead",
              hint: "Frequent switching allows faster response times, but each switch takes CPU cycles.",
              difficulty: "Hard"
            }
          ]
        }
      ]
    }
  ]
};

export const DATABASE_COURSE: Course = {
  course_title: "Database Systems & Architecture",
  overview: "Comprehensive study of relational database design, ER modeling, relational algebra, functional dependencies, 3NF/BCNF normalization, and ACID transaction concurrency.",
  modules: [
    {
      module_id: "mod_db_1",
      title: "Module 1: Relational Architecture & ER Modeling",
      description: "Entity-Relationship diagramming, entity sets, cardinalities, and relational schema mapping.",
      concept_nodes: [
        {
          node_id: "er_modeling",
          label: "ER Modeling & Cardinality",
          dependencies: []
        },
        {
          node_id: "relational_mapping",
          label: "Relational Schema Mapping",
          dependencies: ["er_modeling"]
        }
      ],
      lessons: [
        {
          lesson_id: "les_db_1",
          title: "1.1 Entity-Relationship Data Models & Cardinalities",
          summary: "Learn entities, relationships, attributes, primary keys, and cardinality ratios (1:1, 1:N, M:N).",
          content_markdown: `### 1.1 Entity-Relationship (ER) Data Models & Cardinalities

#### The Entity-Relationship (ER) Model
The Entity-Relationship model is a conceptual schema representing the logical structure of a database enterprise. It abstracts real-world data into **Entities**, **Attributes**, and **Relationships**.

#### Core Constructs:
1. **Entity**: A distinguishable object or concept in the enterprise (e.g., \`Student\`, \`Course\`). Represented as a rectangle.
2. **Attribute**: Properties describing an entity (e.g., \`student_id\`, \`email\`, \`gpa\`). Key attributes are underlined.
3. **Relationship**: Association between two or more entities (e.g., a \`Student\` *enrolls in* a \`Course\`). Represented as a diamond.

#### Mapping Cardinality Constraints:
- **One-to-One (1:1)**: An entity in A is associated with at most one entity in B.
- **One-to-Many (1:N)**: An entity in A is associated with any number of entities in B; B is associated with at most one in A.
- **Many-to-Many (M:N)**: Entities in both sets can associate arbitrarily with multiple entities.

\`\`\`sql
-- Example junction table mapping Many-to-Many (Student <-> Course)
CREATE TABLE Enrollments (
    student_id INT REFERENCES Students(id),
    course_id INT REFERENCES Courses(id),
    semester VARCHAR(16),
    PRIMARY KEY (student_id, course_id)
);
\`\`\`

> **Socratic Insight**: Why can't a Many-to-Many relationship simply place foreign key columns directly into one of the entity tables? *Because relational columns must store atomic values (1NF); an array or list of foreign keys violates atomicity!*`,
          key_takeaways: [
            "Entities represent discrete objects; relationships express associations.",
            "Cardinality constraints define numerical bounds: 1:1, 1:N, and M:N.",
            "Many-to-Many relationships require a composite primary key in an intersection table."
          ],
          quiz: [
            {
              id: "q_db_er_1",
              question: "How are Many-to-Many (M:N) relationships mapped into a relational schema?",
              options: [
                "Via a dedicated intersection/junction table with foreign keys referencing both entities",
                "By adding an array attribute to the primary table",
                "By combining both tables into one single unnormalized table",
                "They cannot be mapped into relational databases"
              ],
              correct_answer: "Via a dedicated intersection/junction table with foreign keys referencing both entities",
              hint: "M:N relationships require a composite primary key consisting of both foreign keys.",
              difficulty: "Medium"
            }
          ]
        },
        {
          lesson_id: "les_db_2",
          title: "1.2 Relational Algebra & Schema Mapping",
          summary: "Formal relational query operators: Selection, Projection, Cartesian Product, Set Union, and Joins.",
          content_markdown: `### 1.2 Relational Algebra & Schema Mapping

#### What is Relational Algebra?
Relational Algebra is a theoretical procedural query language. It takes one or two relations as inputs and produces a new relation as its result.

#### Fundamental Operators:
1. **Selection ($\\sigma$)**: Filters rows satisfying a predicate formula.
   $$\\sigma_{\\text{age} > 20}(\\text{Student})$$
2. **Projection ($\\pi$)**: Selects specified columns while eliminating duplicate tuples.
   $$\\pi_{\\text{name}, \\text{gpa}}(\\text{Student})$$
3. **Cartesian Product ($\\times$)**: Pairs every tuple in relation $R$ with every tuple in $S$.
4. **Natural Join ($\\bowtie$)**: Pairs tuples from two relations having equal values on all common attribute names.

\`\`\`
   Student Relation                       Department Relation
+----+---------+--------+             +--------+----------------+
| ID | Name    | DeptID |             | DeptID | DeptName       |
+----+---------+--------+             +--------+----------------+
| 1  | Alice   | D10    |  -----\\    | D10    | Computer Sci   |
| 2  | Bob     | D20    |  -----/     | D20    | Mathematics    |
+----+---------+--------+             +--------+----------------+
                 \\                       /
                  Natural Join (Student ⋈ Dept)
+----+---------+--------+----------------+
| ID | Name    | DeptID | DeptName       |
+----+---------+--------+----------------+
| 1  | Alice   | D10    | Computer Sci   |
| 2  | Bob     | D20    | Mathematics    |
+----+---------+--------+----------------+
\`\`\`

> **Socratic Insight**: What is the difference between Projection ($\\pi$) and Selection ($\\sigma$)? *Selection acts horizontally to filter rows; Projection acts vertically to pick columns!*`,
          key_takeaways: [
            "Selection ($\sigma$) filters horizontal tuples (rows).",
            "Projection ($\pi$) filters vertical attributes (columns).",
            "Natural Join ($\bowtie$) matches tuples sharing identical attribute values."
          ],
          quiz: [
            {
              id: "q_db_alg_1",
              question: "Which relational algebra operator selects specific columns from a relation while filtering out others?",
              options: [
                "Projection (π)",
                "Selection (σ)",
                "Cartesian Product (×)",
                "Rename (ρ)"
              ],
              correct_answer: "Projection (π)",
              hint: "Projection extracts column attributes; selection filters row tuples.",
              difficulty: "Easy"
            }
          ]
        }
      ]
    },
    {
      module_id: "mod_db_2",
      title: "Module 2: Normalization & Transaction Engine",
      description: "Functional dependencies, 1NF, 2NF, 3NF, BCNF, and ACID transaction safety.",
      concept_nodes: [
        {
          node_id: "normalization",
          label: "Functional Dependencies & 3NF",
          dependencies: ["relational_mapping"]
        },
        {
          node_id: "acid_transactions",
          label: "ACID Transactions",
          dependencies: ["normalization"]
        }
      ],
      lessons: [
        {
          lesson_id: "les_db_3",
          title: "2.1 Functional Dependencies & Normalization (1NF, 2NF, 3NF)",
          summary: "Eliminating redundancy, insertion/deletion anomalies, partial dependencies (2NF), and transitive dependencies (3NF).",
          content_markdown: `### 2.1 Functional Dependencies & Normalization (1NF, 2NF, 3NF)

#### The Goal of Normalization
Normalization systematically decomposes relational schemas to eliminate data redundancy and prevent operational anomalies (update, insertion, and deletion anomalies).

#### Normal Forms Hierarchy:
1. **First Normal Form (1NF)**:
   - All attribute values must be atomic (no repeating groups, comma-separated lists, or nested relations).
2. **Second Normal Form (2NF)**:
   - Must be in 1NF.
   - Eliminates **partial dependencies**: No non-prime attribute may depend on a subset of a composite candidate key.
3. **Third Normal Form (3NF)**:
   - Must be in 2NF.
   - Eliminates **transitive dependencies**: If $X \\rightarrow Y$ and $Y \\rightarrow Z$, then $Z$ is transitively dependent on $X$. For every non-trivial $X \\rightarrow A$, either $X$ is a superkey or $A$ is a prime attribute.
4. **Boyce-Codd Normal Form (BCNF)**:
   - Stricter form of 3NF where for *every* functional dependency $X \\rightarrow A$, $X$ MUST be a superkey.

\`\`\`
   Unnormalized Table (Anomalies Present)
   [ StudentID | CourseID | Instructor | InstructorOffice ]
   --------------------------------------------------------
   Dependency: CourseID -> Instructor -> InstructorOffice (Transitive!)
   
   Decomposed to 3NF:
   Table 1: [ StudentID, CourseID ]
   Table 2: [ CourseID, Instructor ]
   Table 3: [ Instructor, InstructorOffice ]
\`\`\`

> **Socratic Insight**: If an instructor moves offices, how many rows must be updated in the decomposed 3NF table? *Exactly one row in Table 3! In the unnormalized table, hundreds of student records would require updates.*`,
          key_takeaways: [
            "1NF guarantees atomic attribute values.",
            "2NF eliminates partial dependencies on composite keys.",
            "3NF eliminates transitive dependencies (X -> Y -> Z).",
            "BCNF requires all determinants to be superkeys."
          ],
          quiz: [
            {
              id: "q_db_norm_1",
              question: "Which normal form requires the elimination of transitive functional dependencies?",
              options: [
                "Third Normal Form (3NF)",
                "First Normal Form (1NF)",
                "Second Normal Form (2NF)",
                "Fifth Normal Form (5NF)"
              ],
              correct_answer: "Third Normal Form (3NF)",
              hint: "Transitive dependency means X -> Y and Y -> Z where Y is not a candidate key.",
              difficulty: "Easy"
            }
          ]
        },
        {
          lesson_id: "les_db_4",
          title: "2.2 Transaction Processing & ACID Properties",
          summary: "Atomicity, Consistency, Isolation, and Durability, write-ahead logging, and two-phase locking.",
          content_markdown: `### 2.2 Transaction Processing & ACID Properties

#### What is a Database Transaction?
A transaction is a single logical unit of work consisting of multiple read and write operations that must execute cleanly in a concurrent, crash-prone environment.

#### The ACID Properties:
- **A - Atomicity ("All-or-Nothing")**: Either all operations in the transaction execute to completion, or the entire transaction is rolled back with no partial effects.
- **C - Consistency**: A transaction transforms the database from one valid state satisfying all integrity constraints (primary keys, foreign keys, check constraints) to another valid state.
- **I - Isolation**: Concurrently executing transactions cannot see intermediate, uncommitted modifications made by each other. (Implemented via Strict 2PL or MVCC).
- **D - Durability**: Once a transaction is committed, its modifications permanently survive subsequent power failures or crashes (guaranteed by Write-Ahead Logging / WAL).

\`\`\`
          TRANSACTION BEGIN
                 │
           ┌─────┴─────┐
           ▼           ▼
        Deposit     Withdraw
           │           │
           └─────┬─────┘
                 │
            COMMIT?
          /        \\
        YES         NO (Crash/Error)
        /            \\
     PERSIST       ROLLBACK
   (Durability)   (Atomicity)
\`\`\`

> **Socratic Insight**: What database mechanism ensures durability even if the machine loses power one millisecond after writing COMMIT? *Write-Ahead Logging (WAL) flushes log records to non-volatile disk before modifying actual data pages.*`,
          key_takeaways: [
            "Atomicity guarantees all-or-nothing execution.",
            "Consistency preserves database schema integrity invariants.",
            "Isolation prevents race conditions and dirty reads in concurrent sessions.",
            "Durability ensures committed transactions persist across hardware reboots via WAL."
          ],
          quiz: [
            {
              id: "q_db_acid_1",
              question: "Which ACID property guarantees that a committed transaction's effects survive system crashes or power failures?",
              options: [
                "Durability",
                "Atomicity",
                "Isolation",
                "Consistency"
              ],
              correct_answer: "Durability",
              hint: "Write-ahead logging (WAL) guarantees durability on persistent storage.",
              difficulty: "Easy"
            }
          ]
        }
      ]
    }
  ]
};

