const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());

let employees = require('./employees.json');

// Получение списка всех сотрудников
app.get('/employees', (req, res) => {
    res.json(employees);
});

// Получение сотрудника по ID
app.get('/employees/:id', (req, res) => {
    const employee = employees.find(emp => emp.id === req.params.id);
    res.json(employee);
});

// Создание нового сотрудника
app.post('/employees', (req, res) => {
    const newEmployee = req.body;

    // Валидация входящих данных
    if (!newEmployee.id || !newEmployee.firmName || !newEmployee.firstName || !newEmployee.lastName || !newEmployee.salary) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    employees.push(newEmployee);
    fs.writeFileSync('./employees.json', JSON.stringify(employees, null, 2));
    res.json(newEmployee);
});

// Обновление данных сотрудника
app.put('/employees/:id', (req, res) => {
    const index = employees.findIndex(emp => emp.id === req.params.id);
    const updatedEmployee = req.body;

    // Валидация входящих данных
    if (!updatedEmployee.id || !updatedEmployee.firmName || !updatedEmployee.firstName || !updatedEmployee.lastName || !updatedEmployee.salary) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    employees[index] = updatedEmployee;
    fs.writeFileSync('./employees.json', JSON.stringify(employees, null, 2));
    res.json(employees[index]);
});

// Удаление сотрудника
app.delete('/employees/:id', (req, res) => {
    employees = employees.filter(emp => emp.id !== req.params.id);
    fs.writeFileSync('./employees.json', JSON.stringify(employees, null, 2));
    res.json({ message: 'Employee deleted' });
});

app.listen(3000, () => console.log('Server started on port 3000'));

//Пагинация
app.get('/employees', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = employees.slice(startIndex, endIndex);
    res.json(results);
});
//Фильтрация
app.get('/employees', (req, res) => {
    let results = [...employees];
    if (req.query.firmName) {
        results = results.filter(emp => emp.firmName === req.query.firmName);
    }
    if (req.query.salaryRange) {
        const [min, max] = req.query.salaryRange.split('-').map(Number);
        results = results.filter(emp => emp.salary >= min && emp.salary <= max);
    }
    res.json(results);
});
//Middleware для логирования запросов и обработки ошибок
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});