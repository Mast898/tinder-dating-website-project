from flask import Flask, request, render_template_string

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def hello():
    user_input = ''
    if request.method == 'POST':
        user_input = request.form.get('user_input', '')
    
    template = f'''
    <html>
        <body>
            <h1>KekOps</h1>
            <form method="post">
                <input type="text" name="user_input" placeholder="Вводи текст, а то че ты">
                <input type="submit" value="Отправить">
            </form>
            <p>Ваш ввод: {user_input}</p>
        </body>
    </html>
    '''
    return render_template_string(template)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)