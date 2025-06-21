document.addEventListener('DOMContentLoaded', function() {
    const games = [5, 6, 7, 8, 9, 10];
    const fields = games.flatMap(g => [`g${g}P1`, `g${g}P2`]);

    // Input and paste handling functions (unchanged from previous version)
    function handleCoeffInput(e, idx) {
        let input = e.target;
        let val = input.value.replace(/[^\d]/g, ''); 
        if (val.length === 3) {
            val = val.substring(0, 1) + '.' + val.substring(1, 3);
        } else if (val.length > 3) {
            val = val.substring(0, 1) + '.' + val.substring(1, 3);
        }
        input.value = val;
        if (val.length === 4) {
            if (idx === fields.length - 1) {
                input.blur();
                calculateWinner();
            } else {
                const nextInput = document.getElementById(fields[idx + 1]);
                if (nextInput) {
                    nextInput.focus();
                } else {
                    input.blur();
                    calculateWinner();
                }
            }
        }
        calculateWinner();
    }

    function handleCoeffPaste(e, idx) {
        e.preventDefault();
        let input = e.target;
        let text = (e.clipboardData || window.clipboardData).getData('text');
        text = text.replace(/[^\d]/g, '');
        if (text.length === 3) {
            text = text.substring(0, 1) + '.' + text.substring(1, 3);
        } else if (text.length > 3) {
            text = text.substring(0, 1) + '.' + text.substring(1, 3); 
        } else if (text.length === 2) {
             text = '1.' + text;
        }
        input.value = text;
        if (text.length === 4) {
            if (idx === fields.length - 1) {
                input.blur();
                calculateWinner();
            } else {
                const nextInput = document.getElementById(fields[idx + 1]);
                if (nextInput) {
                    nextInput.focus();
                } else {
                    input.blur();
                    calculateWinner();
                }
            }
        }
        calculateWinner();
    }

    fields.forEach((id, idx) => {
        const input = document.getElementById(id);
        if (input) {
            input.setAttribute('maxlength', '4');
            input.setAttribute('inputmode', 'decimal');
            input.classList.add('text-center');
            input.addEventListener('input', (e) => handleCoeffInput(e, idx));
            input.addEventListener('paste', (e) => handleCoeffPaste(e, idx));
            input.addEventListener('keypress', function(event) {
                if (event.key === '.') {
                    if (input.value.includes('.')) {
                        event.preventDefault();
                    }
                    return;
                }
                if (!/\d/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Enter') {
                    event.preventDefault();
                }
                if (event.key === 'Enter') {
                    event.preventDefault();
                    if (idx === fields.length - 1) {
                        input.blur();
                        calculateWinner();
                    } else {
                        const nextInput = document.getElementById(fields[idx + 1]);
                        if (nextInput) {
                            nextInput.focus();
                        } else {
                            input.blur();
                            calculateWinner();
                        }
                    }
                }
            });
        }
    });

    // Main calculation function
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

                if (!isNaN(p1Val) && p1Val >= 1.00 && p1Val <= 10.00) { 
                    player1Coeffs.push(p1Val);
                    p1Input.classList.remove('is-invalid');
                } else if (p1Input.value.length > 0) {
                    p1Input.classList.add('is-invalid');
                    allCoeffsValid = false;
                } else {
                    player1Coeffs.push(NaN);
                    p1Input.classList.remove('is-invalid');
                }

                if (!isNaN(p2Val) && p2Val >= 1.00 && p2Val <= 10.00) {
                    player2Coeffs.push(p2Val);
                    p2Input.classList.remove('is-invalid');
                } else if (p2Input.value.length > 0) {
                    p2Input.classList.add('is-invalid');
                    allCoeffsValid = false;
                } else {
                    player2Coeffs.push(NaN);
                    p2Input.classList.remove('is-invalid');
                }
            }
        }

        if (!allCoeffsValid) {
            document.getElementById('error').textContent = 'Проверьте формат коэффициентов (например, 1.85).';
            document.getElementById('error').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            return;
        }

        if (isNaN(player1Coeffs[0]) || isNaN(player2Coeffs[0])) {
            document.getElementById('error').textContent = 'Заполните коэффициенты для Гейма 5, чтобы начать расчет.';
            document.getElementById('error').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            return;
        }
        
        document.getElementById('error').style.display = 'none';
        document.getElementById('error').textContent = '';

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
                    if (spreadP1 > 0) { // Коэффициент снизился (Игрок 1 становится сильнее)
                        totalDecreaseSpreadP1 += spreadP1;
                    } else if (spreadP1 < 0) { // Коэффициент вырос (Игрок 1 становится слабее)
                        totalIncreaseSpreadP1 += Math.abs(spreadP1);
                    }
                }

                if (!isNaN(p2Previous) && !isNaN(p2Current)) {
                    const spreadP2 = p2Previous - p2Current;
                    if (spreadP2 > 0) { // Коэффициент снизился (Игрок 2 становится сильнее)
                        totalDecreaseSpreadP2 += spreadP2;
                    } else if (spreadP2 < 0) { // Коэффициент вырос (Игрок 2 становится слабее)
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
                // Get decimal part as an integer (e.g., 1.62 -> 62)
                const decimalP1 = Math.round((p1Current % 1) * 100);
                const decimalP2 = Math.round((p2Current % 1) * 100);
                
                if (decimalP1 < decimalP2) {
                    player1SmallestDecimalWins++;
                } else if (decimalP2 < decimalP1) {
                    player2SmallestDecimalWins++;
                }
                // If decimals are equal, neither player gets a "win" for this game.
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

        document.getElementById('overall_winner_smallest_decimal').innerHTML = smallestDecimalWinnerMessage; // Output new result

        document.getElementById('result').style.display = 'block';
    }

    calculateWinner();
});
