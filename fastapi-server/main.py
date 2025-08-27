import fastapi as fa

from fastapi.middleware.cors import CORSMiddleware

from routers.machine_learning.regression import router as router_machine_learning_regression
from routers.machine_learning.classification import router as router_machine_learning_classification
from routers.machine_learning.clustering import router as router_machine_learning_clustering
from routers.machine_learning.associaton_rule_learning import router as router_machine_learning_associaton_rule_learning

# >>> Pylance for type checking (python.analysis.typeCheckingMode settings)
# >>> Launch from CL: fastapi dev fastapi-server/main.py

description = """LearningAI backend server implement all AI algorithms.

## Packages

* **Python** 3.11.9
* **FastAPI** 0.116.1
* **Numpy** 2.3.2
* **Pandas** 2.3.1
* **SciKit-Learn** 1.7.1
* **PyMongo** 4.13.2
* **Termcolor** 3.1.0
"""

app = fa.FastAPI(
    title="LearningAI 🤖",
    description=description,
    summary="LearningAI backend server",
    version="1.0.0"
)

app.add_middleware(CORSMiddleware, allow_origins=[ 'http://localhost:3000' ], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(router_machine_learning_regression)
app.include_router(router_machine_learning_classification)
app.include_router(router_machine_learning_clustering)
app.include_router(router_machine_learning_associaton_rule_learning)