import fastapi as fa

from fastapi.middleware.cors import CORSMiddleware

from routers.machine_learning.regression import router as router_machine_learning_regression

# >>> Pylance for type checking (python.analysis.typeCheckingMode settings)
# >>> Launch from CL: fastapi dev fastapi-server/main.py

app = fa.FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=[ 'http://localhost:3000' ], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(router_machine_learning_regression)