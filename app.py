from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Perguntas e respostas do quiz
quiz_questions = [
    {
        "id": 1,
        "question": "Qual linguagem de programação usa a função 'print()' para exibir texto?",
        "answer": "python"
    },
    {
        "id": 2,
        "question": "Em Python, qual estrutura de dados é usada para armazenar pares de chave-valor?",
        "answer": "dicionario"
    },
    {
        "id": 3,
        "question": "Qual método é usado para adicionar um elemento ao final de uma lista em Python?",
        "answer": "append"
    }
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/check-answer', methods=['POST'])
def check_answer():
    data = request.json
    question_id = data.get('questionId')
    user_answer = data.get('answer').lower().strip()
    
    # Encontrar a questão correspondente
    question = next((q for q in quiz_questions if q['id'] == question_id), None)
    
    if not question:
        return jsonify({"error": "Questão não encontrada"}), 400
    
    # Verificar resposta
    correct = user_answer == question['answer'].lower()
    
    return jsonify({
        "correct": correct,
        "correctAnswer": question['answer'] if not correct else None
    })

if __name__ == '__main__':
    app.run(debug=True)