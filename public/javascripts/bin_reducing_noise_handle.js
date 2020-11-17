$(function () {
  $("#submitForm").submit(function (event) {
    if (
      $("#listData").val().trim().length > 0 &&
      $("#numberBin").val().trim().length > 0
    ) {
      event.preventDefault();
      dataRaw = $("#listData").val().replace(" ", "");
      bin = parseInt($("#numberBin").val());
      data = string_to_array(dataRaw);

      if (data.every((x) => typeof element === "number")) {
        alert("You must import number data");
      } else {
        data = data.map((x) => parseInt(x));

        $("#resultData").val(JSON.stringify(data));
        binning_width = bin_width(data, bin)
        $("#resultBinWidth").val(JSON.stringify(binning_width));
        $("#resultWidthReducingNoiseCenter").val(JSON.stringify(reducing_noise_center(binning_width)));
        $("#resultWidthReducingNoiseAvg").val(JSON.stringify(reducing_noise_avg(binning_width)));
        $("#resultWidthReducingNoiseBorder").val(JSON.stringify(reducing_noise_border(binning_width)));

        binning_frequency = bin_frequency(data, bin)
        $("#resultBinFrequency").val(JSON.stringify(binning_frequency));
        $("#resultFrequencyReducingNoiseCenter").val(JSON.stringify(reducing_noise_center(binning_frequency)));
        $("#resultFrequencyReducingNoiseAvg").val(JSON.stringify(reducing_noise_avg(binning_frequency)));
        $("#resultFrequencyReducingNoiseBorder").val(JSON.stringify(reducing_noise_border(binning_frequency)));

      }
    } else {
      alert("You must import all textbox");
    }
  });
});

function string_to_array(str) {
  return str.split(",");
}

// Bining

function bin_frequency(arr, n) {
  result = [];
  length = arr.length;
  f = Math.round(length / n);
  for (let i = 0; i < n; i++) {
    arr_temp = [];
    for (let j = i * f; j < (i + 1) * f; j++) {
      if (j >= length) break;
      arr_temp.push(arr[j]);
    }
    if (length % n > 0 && i + 1 == n) {
      for (let j = (i + 1) * f; j < arr.length; j++) {
        arr_temp.push(arr[j]);
      }
    }
    result.push(arr_temp);
  }
  return result;
}

function bin_width(arr, n) {
  result = [];
  max = Math.max(...arr);
  min = Math.min(...arr);
  width = Math.round((max - min) / n);
  arr_border = [];
  for (let i = 0; i < n + 1; i++) {
    arr_border.push(min + width * i);
  }

  for (let i = 0; i < n; i++) {
    arr_temp = [];
    arr.forEach((ele) => {
      if (ele >= arr_border[i] && ele <= arr_border[i + 1]) arr_temp.push(ele);
    });
    result.push(arr_temp);
  }
  return result;
}

// Reducing Noise
function reducing_noise_center(arr) {
  return arr.map((x) => {
    left = x[Math.floor((x.length - 1) / 2)];
    right = x[Math.ceil((x.length - 1) / 2)];
    if (left == right) return x.map((x) => left);
    else {
      center = Math.round(Math.random()) == 0 ? right : left;
      return x.map((x) => center);
    }
  });
}

function reducing_noise_avg(arr) {
  return arr.map((x) => {
    avg = Math.round(x.reduce((y, z) => y + z) / x.length);
    return x.map((x) => avg);
  });
}

function reducing_noise_border(arr) {
  return arr.map((x) => {
    left = x[0];
    right = x[x.length - 1];
    if (left == right) {
      return x.map((x) => left);
    } else {
      to_left = x.reduce((y, z) => (left - z > right - z ? y + 1 : y), 0);
      to_right = x.reduce((y, z) => (left - z < right - z ? y + 1 : y), 0);
      if (to_left < to_right)
        return x.map((x) => (x == left || x == right ? x : left));
      else if (to_right > to_left)
        return x.map((x) => (x == left || x == right ? x : right));
      else {
        center = Math.round(Math.random()) == 0 ? right : left;
        return x.map((x) => (x == left || x == right ? x : right));
      }
    }
  });
}
