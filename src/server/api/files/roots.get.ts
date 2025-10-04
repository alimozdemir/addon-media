import { useFileUtils } from '../../utils/useFileUtils';

export default defineEventHandler(() => {
    const utils = useFileUtils();
    const roots = Object.entries(utils.allowedRoots).map(([key, absolutePath]) => ({
        key,
        label: key === 'home' ? '~' : `/${key}`,
        absolutePath,
    }));
    return { roots };
});


