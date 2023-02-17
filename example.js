async function main() {
  const compute = require('dcp/compute');

  // inputSet : array containing arbitary, enumerable elements
  const inputSet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  // workFunction : function that will be mapped to each element in the inputSet
  function workFunction(number) {
    progress(0.00) // progress call; workFunction at 0% completion
    result = Math.sqrt(number)
    progress(1.00) // progress call; workFunction at 100% completion
    return result
  }
  // # DCP Job definition, configuration, and execution
  const job = compute.for(inputSet, workFunction) // maps workFunction to each element in inputSet

  // DCP job will be compute on the public network (dcp.work, press 'Start'), or in a private compute
  //  (dcp.work/<joinKey> with <joinSecret> as the password)if joinKey and joinSecret are specified
  if (typeof process.env.joinKey !== 'undefined') {
    job.computeGroups = [{joinKey: process.env.joinKey, joinSecret: process.env.joinSecret}];
  }

  // Events, more info here: https://docs.dcp.dev/specs/compute-api.html?highlight=events#eventemitters
  job.on('readystatechange', function (newState) {
    console.log(` Status: ${newState}`)
  })

  job.on('accepted', function () {
    console.log(`  Job id: ${job.id}`)
    console.log(`  Job accepted, waiting on first results...`)
    DCP_accept_st = new Date().getTime()
  })

  job.on('error', function job$$onError(error) {
    console.error(`  Job error:`, error);
  })

  // job.exec launches the job to the network
  const resultSet = await job.exec()
  // const resultSet = await job.localExec()   // comment out line above and uncomment this one for local tests

  // DISPLAY RESULTS
  console.log(resultSet)
}

require('dcp-client').init('https://scheduler.distributed.computer').then(main);

// to run on the public network, in terminal
'node node_demo.js'
// to run in a specified compute group (example: dcp.work/demo compute group):
'joinKey=demo joinSecret=dcp node node_demo.js'