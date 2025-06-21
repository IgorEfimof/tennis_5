document.addEventListener('DOMContentLoaded', function() {
    const games = [5, 6, 7, 8, 9, 10];
    const fields = games.flatMap(g => [`g${g}P1`, `g${g}P2`]);
    const inputElements = fields.map(id => document.getElementById(id));

    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    const errorText = document.getElementById('error'); 

    const keyboardContainer = document.getElementById('custom-keyboard-container');
    const keyboard = document.getElementById('custom-keyboard');
    let activeInput = null; // Переменная для отслеживания активного поля ввода

    // --- Keyboard Logic ---
    function showKeyboard(input) {
        activeInput = input;
        keyboardContainer.classList.add('show');
        resultDiv.classList.remove('visible'); // Скрываем результат при открытии клавиатуры
        errorDiv.classList.remove('visible'); // Скрываем ошибки при открытии клавиатуры
    }

    function hideKeyboard() {
        activeInput = null;
        keyboardContainer.classList.remove('show');
        calculateWinner(); // Пересчитываем и показываем результат, когда клавиатура скрывается
    }

    // Обработчики событий для полей ввода (фокус/блюр)
    inputElements.forEach((input, index) => {
        if (input) {
            // При фокусе на поле ввода показываем клавиатуру
            input.addEventListener('focus', function() {
                showKeyboard(this);
            });

            // Для мобильных устройств: иногда blur не срабатывает, используем touchstart на body
            // Но чтобы не скрывать сразу, нужно управлять этим осторожно
            // Пока оставляем hideKeyboard только по "Далее" или после заполнения всех полей
            input.addEventListener('blur', function() {
                // Не скрываем сразу, чтобы можно было переключиться на другое поле или дозаполнить
                // Скрытие будет по кнопке "Далее" или когда все поля заполнены
            });

            // Настроим обработку input для форматирования и перехода
            input.addEventListener('input', function(e) {
                let val = this.value.replace(/[^\d]/g, ''); 
                if (val.length === 3) {
                    val = val.substring(0, 1) + '.' + val.substring(1, 3);
                } else if (val.length > 3) {
                    val = val.substring(0, 1) + '.' + val.substring(1, 3);
                }
                this.value = val;

                if (this.value.length === this.maxLength && index < inputElements.length - 1) {
                    // Если текущее поле заполнено и это не последнее поле, переходим к следующему
                    inputElements[index + 1].focus();
                } else if (this.value.length === this.maxLength && index === inputElements.length - 1) {
                    // Если заполнено последнее поле, скрываем клавиатуру и считаем
                    this.blur();
                    hideKeyboard();
                }
            });
        }
    });

    // Обработчик кликов по кнопкам клавиатуры
    keyboard.addEventListener('click', function(e) {
        if (!activeInput) return; // Если нет активного поля, ничего не делаем

        const button = e.target.closest('button');
        if (!button) return;

        const key = button.dataset.key;

        if (key === 'delete') {
            activeInput.value = activeInput.value.slice(0, -1);
        } else if (key === '.') {
            if (!activeInput.value.includes('.')) {
                // Если поле пустое и вводим '.', начинаем с '1.'
                if (activeInput.value === '') {
                    activeInput.value = '1.';
                } else {
                    activeInput.value += '.';
                }
            }
        } else if (key === 'next') {
            const currentIndex = inputElements.indexOf(activeInput);
            if (currentIndex !== -1 && currentIndex < inputElements.length - 1) {
                inputElements[currentIndex + 1].focus(); // Переходим к следующему полю
            } else {
                hideKeyboard(); // Если последнее поле или нет следующего, скрываем клавиатуру
            }
        } else { // Числовые кнопки
            if (activeInput.value.length < activeInput.maxLength) {
                activeInput.value += key;
            }
        }
        
        // Триггерим событие input, чтобы сработала логика форматирования и перехода
        const event = new Event('input', { bubbles: true });
        activeInput.dispatchEvent(event);
    });

    // --- Main Calculation Function (unchanged from previous version, just ensure visibility handling) ---
    function calculateWinner() {
        let player1Coeffs = [];
        let player2Coeffs = [];
        let allCoeffsValid = true;

        for (let i = 5; i <= 10; i++) {
            const p1Input = document.getElementById(`g${i}P1`);
            const p2Input = document.getElementById(`g${i}P2`);

            if (p1Input && p2Input) {
                const p1Val = parseFloat(p1Input.value);
                const p2Val = parseFloat(p2Input.value);

                // Validation for Player 1
                if (!isNaN(p1Val) && p1Val >= 1.00 && p1Val <= 10.00) { 
                    player1Coeffs.push(p1Val);
                    p1Input.classList.remove('is-invalid');
                } else if (p1Input.value.length > 0) { // If there's input but it's invalid
                    p1Input.classList.add('is-invalid');
                    allCoeffsValid = false;
                } else { // If input is empty
                    player1Coeffs.push(NaN);
                    p1Input.classList.remove('is-invalid'); // Not invalid if just empty
                }

                // Validation for Player 2
                if (!isNaN(p2Val) && p2Val >= 1.00 && p2Val <= 10.00) {
                    player2Coeffs.push(p2Val);
                    p2Input.classList.remove('is-invalid');
                } else if (p2Input.value.length > 0) { // If there's input but it's invalid
                    p2Input.classList.add('is-invalid');
                    allCoeffsValid = false;
                } else { // If input is empty
                    player2Coeffs.push(NaN);
                    p2Input.classList.remove('is-invalid'); // Not invalid if just empty
                }
            }
        }

        // Determine if enough data is available to show results
        const hasMinimumInput = !isNaN(player1Coeffs[0]) && !isNaN(player2Coeffs[0]);

        if (!allCoeffsValid) {
            errorText.textContent = 'Проверьте формат коэффициентов (например, 1.85).';
            errorDiv.classList.add('visible');
            resultDiv.classList.remove('visible'); 
            return;
        }

        if (!hasMinimumInput) {
            errorText.textContent = 'Заполните коэффициенты для Гейма 5, чтобы начать расчет.';
            errorDiv.classList.add('visible');
            resultDiv.classList.remove('visible'); 
            return;
        }
        
        errorText.textContent = ''; 
        errorDiv.classList.remove('visible'); 
        
        // If we are showing results, make sure resultDiv is visible
        if (!keyboardContainer.classList.contains('show')) { // Only show results if keyboard is not active
            resultDiv.classList.add('visible'); 
        }

        let totalDecimalPlayer1 = 0;
        let totalDecimalPlayer2 = 0;
        
        let totalDecreaseSpreadP1 = 0;
        let totalIncreaseSpreadP1 = 0;
        let totalDecreaseSpreadP2 = 0;
        let totalIncreaseSpreadP2 = 0;

        for (let i = 0; i < games.length; i++) {
            const p1Current = player1Coeffs[i];
            const p2Current = player2Coeffs[i];

            if (!isNaN(p1Current)) {
                totalDecimalPlayer1 += (p1Current - Math.floor(p1Current));
            }
            if (!isNaN(p2Current)) {
                totalDecimalPlayer2 += (p2Current - Math.floor(p2Current));
            }

            if (i > 0) {
                const p1Previous = player1Coeffs[i - 1];
                const p2Previous = player2Coeffs[i - 1];

                if (!isNaN(p1Previous) && !isNaN(p1Current)) { 
                    const spreadP1 = p1Previous - p1Current;
                    if (spreadP1 > 0) { 
                        totalDecreaseSpreadP1 += spreadP1;
                    } else if (spreadP1 < 0) { 
                        totalIncreaseSpreadP1 += Math.abs(spreadP1);
                    }
                }

                if (!isNaN(p2Previous) && !isNaN(p2Current)) {
                    const spreadP2 = p2Previous - p2Current;
                    if (spreadP2 > 0) { 
                        totalDecreaseSpreadP2 += spreadP2;
                    } else if (spreadP2 < 0) { 
                        totalIncreaseSpreadP2 += Math.abs(spreadP2);
                    }
                }
            }
        }
        
        // --- Output Section ---

        // Decimal Sum Analysis
        let overallWinnerDecimalSumMessage;
        let advantageDecimal = Math.abs(totalDecimalPlayer1 - totalDecimalPlayer2);

        if (totalDecimalPlayer1 < totalDecimalPlayer2) {
            overallWinnerDecimalSumMessage = `Победитель: **Игрок 1** (преимущество ${advantageDecimal.toFixed(4)})`;
        } else if (totalDecimalPlayer2 < totalDecimalPlayer1) {
            overallWinnerDecimalSumMessage = `Победитель: **Игрок 2** (преимущество ${advantageDecimal.toFixed(4)})`;
        } else {
            overallWinnerDecimalSumMessage = "Вероятно трость (разница дес. частей = 0)";
        }

        // --- Spread Analysis for each player and overall verdict ---

        // Player 1 Spread Details and Confidence/Uncertainty
        let p1Uncertainty = 0;
        if ((totalDecreaseSpreadP1 + totalIncreaseSpreadP1) > 0) {
             p1Uncertainty = (totalIncreaseSpreadP1 / (totalDecreaseSpreadP1 + totalIncreaseSpreadP1)) * 100;
        }
        let p1SpreadDetails = `Игрок 1: Снижение Кф. **↓${totalDecreaseSpreadP1.toFixed(4)}** | Уверенность **${(100 - p1Uncertainty).toFixed(2)}%**`;
        
        // Player 2 Spread Details and Confidence/Uncertainty
        let p2Uncertainty = 0;
        if ((totalDecreaseSpreadP2 + totalIncreaseSpreadP2) > 0) {
            p2Uncertainty = (totalIncreaseSpreadP2 / (totalDecreaseSpreadP2 + totalIncreaseSpreadP2)) * 100;
        }
        let p2SpreadDetails = `Игрок 2: Снижение Кф. **↓${totalDecreaseSpreadP2.toFixed(4)}** | Уверенность **${(100 - p2Uncertainty).toFixed(2)}%**`;

        // Overall Spread Verdict
        let spreadVerdictMessage = "Вердикт по разбегу: ";

        let p1HasHigherChances = (totalDecreaseSpreadP1 > 0) && (totalDecreaseSpreadP1 > totalIncreaseSpreadP1);
        let p2HasHigherChances = (totalDecreaseSpreadP2 > 0) && (totalDecreaseSpreadP2 > totalIncreaseSpreadP2);

        const anySpreadMovement = (totalDecreaseSpreadP1 + totalIncreaseSpreadP1 + totalDecreaseSpreadP2 + totalIncreaseSpreadP2) > 0;

        if (!anySpreadMovement) {
            spreadVerdictMessage += "Недостаточно данных (нет изменений Кф.)";
        } else if (p1HasHigherChances && !p2HasHigherChances) {
            spreadVerdictMessage += "**Игрок 1** имеет выше шансы.";
        } else if (!p1HasHigherChances && p2HasHigherChances) {
            spreadVerdictMessage += "**Игрок 2** имеет выше шансы.";
        } else if (p1HasHigherChances && p2HasHigherChances) {
            if (totalDecreaseSpreadP1 > totalDecreaseSpreadP2) {
                spreadVerdictMessage += "Оба игрока сильны, но у **Игрока 1** более выражено снижение Кф.";
            } else if (totalDecreaseSpreadP2 > totalDecreaseSpreadP1) {
                spreadVerdictMessage += "Оба игрока сильны, но у **Игрока 2** более выражено снижение Кф.";
            } else {
                spreadVerdictMessage += "Оба игрока **сильны** (одинаковое преобладание снижения Кф.)";
            }
        } else {
            if (totalIncreaseSpreadP1 > 0 || totalIncreaseSpreadP2 > 0) { 
                spreadVerdictMessage += "Неопределённо (преобладание повышения Кф. или нейтрально)";
            } else {
                 spreadVerdictMessage += "Неопределённо";
            }
        }

        // --- New Calculation: Smallest Decimal Part Wins ---
        let player1SmallestDecimalWins = 0;
        let player2SmallestDecimalWins = 0;
        let comparisonCount = 0; // Count of valid comparisons made

        for (let i = 0; i < games.length; i++) {
            const p1Current = player1Coeffs[i];
            const p2Current = player2Coeffs[i];

            if (!isNaN(p1Current) && !isNaN(p2Current)) {
                const decimalP1 = Math.round((p1Current % 1) * 100);
                const decimalP2 = Math.round((p2Current % 1) * 100);
                
                if (decimalP1 < decimalP2) {
                    player1SmallestDecimalWins++;
                } else if (decimalP2 < decimalP1) {
                    player2SmallestDecimalWins++;
                }
                comparisonCount++;
            }
        }

        let smallestDecimalWinnerMessage = "Вероятный победитель (меньшая дес. часть): ";

        if (comparisonCount === 0) {
            smallestDecimalWinnerMessage += "Недостаточно данных (нет пар Кф. для сравнения)";
        } else if (player1SmallestDecimalWins > player2SmallestDecimalWins) {
            smallestDecimalWinnerMessage += `**Игрок 1** (${player1SmallestDecimalWins} против ${player2SmallestDecimalWins})`;
        } else if (player2SmallestDecimalWins > player1SmallestDecimalWins) {
            smallestDecimalWinnerMessage += `**Игрок 2** (${player2SmallestDecimalWins} против ${player1SmallestDecimalWins})`;
        } else {
            smallestDecimalWinnerMessage += "Ничья (равное количество меньших дес. частей)";
        }

        document.getElementById('player1_sum').textContent = `Сумма дес. частей (И1): ${totalDecimalPlayer1.toFixed(4)}`;
        document.getElementById('player2_sum').textContent = `Сумма дес. частей (И2): ${totalDecimalPlayer2.toFixed(4)}`;
        document.getElementById('overall_winner_decimal_sum').innerHTML = overallWinnerDecimalSumMessage;
        
        document.getElementById('p1_spread_summary').innerHTML = p1SpreadDetails;
        document.getElementById('p2_spread_summary').innerHTML = p2SpreadDetails;
        document.getElementById('overall_winner_spread_analysis').innerHTML = spreadVerdictMessage;

        document.getElementById('overall_winner_smallest_decimal').innerHTML = smallestDecimalWinnerMessage;
    }

    // Call calculateWinner initially to set the correct state
    calculateWinner();
});
