export default defineEventHandler(async (event) => {
    const task = await runTask('download', { payload: { url: 'https://www.google.com' } });
    
    return task
});