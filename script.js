document.addEventListener('DOMContentLoaded', function() {
    const addInvestmentBtn = document.getElementById('addInvestmentBtn');
    const showAddFormBtn = document.getElementById('showAddFormBtn');
    const addInvestmentForm = document.getElementById('addInvestmentForm');
    const updateInvestmentForm = document.getElementById('updateInvestmentForm');
    const investmentsTableBody = document.querySelector('#investmentsTable tbody');
    const totalValueElement = document.getElementById('totalValue');
    const updateInvestmentBtn = document.getElementById('updateInvestmentBtn');
    const canvas = document.getElementById('portfolioChart');
    const ctx = canvas.getContext('2d');
    
    let investments = JSON.parse(localStorage.getItem('investments')) || [];
    let currentUpdateIndex = null;

    const updateTable = () => {
        investmentsTableBody.innerHTML = '';
        investments.forEach((investment, index) => {
            const percentageChange = ((investment.currentValue - investment.amountInvested) / investment.amountInvested * 100).toFixed(2);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${investment.assetName}</td>
                <td>$${investment.amountInvested.toFixed(2)}</td>
                <td>$${investment.currentValue.toFixed(2)}</td>
                <td>${percentageChange}%</td>
                <td>
                    <button class="update-btn" data-index="${index}">Update</button>
                    <button class="remove-btn" data-index="${index}">Remove</button>
                </td>
            `;

            investmentsTableBody.appendChild(row);
        });

        const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
        totalValueElement.textContent = totalValue.toFixed(2);
        
        drawChart();
    };

    const drawChart = () => {
        const labels = investments.map(inv => inv.assetName);
        const data = investments.map(inv => inv.currentValue);
        const colors = ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'];
    
        const total = data.reduce((sum, value) => sum + value, 0);
        let startAngle = 0;
    
        const canvas = document.getElementById('portfolioChart');
        
        // Set the canvas size to a fixed smaller size
        const chartSize = Math.min(canvas.parentElement.clientWidth, 300); // Set max width to 300px
        canvas.width = chartSize;
        canvas.height = chartSize; // Keep it square
    
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous chart
        
        data.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;
    
            // Draw the pie slice
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);
            ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, startAngle, endAngle);
            ctx.closePath();
            
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
    
            // Calculate the label position
            const labelAngle = startAngle + sliceAngle / 2;
            const labelX = (canvas.width / 2) + (canvas.width / 3) * Math.cos(labelAngle);
            const labelY = (canvas.height / 2) + (canvas.height / 3) * Math.sin(labelAngle);
    
            // Draw the label
            ctx.fillStyle = '#000';
            ctx.fillText(labels[index], labelX, labelY);
    
            startAngle = endAngle;
        });
    };
    
    const saveToLocalStorage = () => {
        localStorage.setItem('investments', JSON.stringify(investments));
    };

    const addInvestment = () => {
        const assetName = document.getElementById('assetName').value.trim();
        const amountInvested = parseFloat(document.getElementById('amountInvested').value);
        const currentValue = parseFloat(document.getElementById('currentValue').value);

        if (!assetName || isNaN(amountInvested) || isNaN(currentValue) || amountInvested <= 0 || currentValue < 0) {
            alert("Please enter valid data.");
            return;
        }

        investments.push({ assetName, amountInvested, currentValue });
        saveToLocalStorage();
        updateTable();
        document.getElementById('assetName').value = '';
        document.getElementById('amountInvested').value = '';
        document.getElementById('currentValue').value = '';
        addInvestmentForm.classList.add('hidden');
    };

    const showUpdateForm = (index) => {
        currentUpdateIndex = index;
        const investment = investments[index];
        
        document.getElementById('updateAssetName').value = investment.assetName;
        document.getElementById('updateAmountInvested').value = investment.amountInvested.toFixed(2);
        document.getElementById('updateCurrentValue').value = investment.currentValue.toFixed(2);
        
        updateInvestmentForm.classList.remove('hidden');
    };

    const updateInvestment = () => {
        if (currentUpdateIndex === null) return;

        const newValue = parseFloat(document.getElementById('updateCurrentValue').value);

        if (isNaN(newValue) || newValue < 0) {
            alert("Please enter a valid value.");
            return;
        }

        investments[currentUpdateIndex].currentValue = newValue;
        saveToLocalStorage();
        updateTable();
        updateInvestmentForm.classList.add('hidden');
        currentUpdateIndex = null;
    };

    const removeInvestment = (index) => {
        if (confirm('Are you sure you want to remove this investment?')) {
            investments.splice(index, 1);
            saveToLocalStorage();
            updateTable();
        }
    };

    // Event delegation to handle clicks on dynamically added buttons
    investmentsTableBody.addEventListener('click', function(event) {
        if (event.target.classList.contains('update-btn')) {
            const index = event.target.dataset.index;
            showUpdateForm(parseInt(index, 10));
        }
        if (event.target.classList.contains('remove-btn')) {
            const index = event.target.dataset.index;
            removeInvestment(parseInt(index, 10));
        }
    });

    // Event listener for updating investment
    updateInvestmentBtn.addEventListener('click', updateInvestment);

    showAddFormBtn.addEventListener('click', () => {
        addInvestmentForm.classList.toggle('hidden');
    });

    addInvestmentBtn.addEventListener('click', addInvestment);

    updateTable();  // Initial load of investments
});
