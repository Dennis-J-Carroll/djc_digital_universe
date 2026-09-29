/* Small, dependency-free companion for Neural Theory Lab's research section. */
(() => {
  function renderFrontierMath() {
    if (!window.katex) return;
    document.querySelectorAll('[data-frontier-math]').forEach(element => {
      window.katex.render(element.getAttribute('data-frontier-math'), element, {
        displayMode: false,
        throwOnError: false,
        output: 'html'
      });
    });
  }

  function initializeSsdDemo() {
    const table = document.querySelector('#ssd-matrix tbody');
    if (!table) return;

    const lengthInput = document.getElementById('ssd-length');
    const decayInput = document.getElementById('ssd-decay');
    const chunkInput = document.getElementById('ssd-chunk');

    function render() {
      const length = Number(lengthInput.value);
      const decay = Number(decayInput.value);
      const chunk = Number(chunkInput.value);
      const inputs = Array.from({ length }, (_, i) => i % 2 === 0 ? 1 : 0);

      // Recurrent path: h_t = decay * h_(t-1) + x_t, y_t = h_t.
      const recurrence = [];
      let state = 0;
      inputs.forEach(value => {
        state = decay * state + value;
        recurrence.push(state);
      });

      // Matrix path: L_ij = decay^(i-j) for i >= j, then y = Lx.
      const product = [];
      const rows = [];
      rows.push('<tr><th scope="col"></th>' + inputs.map((_, j) => `<th scope="col">${j + 1}</th>`).join('') + '</tr>');
      for (let i = 0; i < length; i++) {
        let sum = 0;
        const cells = [];
        for (let j = 0; j < length; j++) {
          const weight = j <= i ? Math.pow(decay, i - j) : 0;
          sum += weight * inputs[j];
          const intensity = Math.round(89 + weight * 150);
          const style = weight ? ` style="background:rgb(85,${intensity},${Math.min(255, intensity + 8)})"` : '';
          const boundary = i > 0 && i % chunk === 0 ? ' chunk-edge' : '';
          cells.push(`<td class="${weight ? '' : 'zero'}${boundary}"${style} title="Output ${i + 1}, input ${j + 1}: ${weight.toFixed(3)}">${weight ? weight.toFixed(2) : '·'}</td>`);
        }
        product.push(sum);
        rows.push(`<tr><th scope="row">${i + 1}</th>${cells.join('')}</tr>`);
      }

      table.innerHTML = rows.join('');
      document.getElementById('ssd-length-value').textContent = String(length);
      document.getElementById('ssd-decay-value').textContent = decay.toFixed(2);
      document.getElementById('ssd-chunk-value').textContent = String(chunk);
      document.getElementById('ssd-recurrence').textContent = recurrence.map(value => value.toFixed(2)).join(' · ');
      document.getElementById('ssd-product').textContent = product.map(value => value.toFixed(2)).join(' · ');
      document.getElementById('ssd-error').textContent = Math.max(...product.map((value, i) => Math.abs(value - recurrence[i]))).toExponential(1);
    }

    [lengthInput, decayInput, chunkInput].forEach(input => input.addEventListener('input', render));
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderFrontierMath();
    initializeSsdDemo();
  });
})();
