import { getPackageRootPath } from './utils';
import path from 'path';


describe('getPackageRootPath', () => {
  it('should return the correct package root path', () => {
    const packageRootPath = getPackageRootPath();
    expect(packageRootPath).toContain(path.join('packages', 'backend'));
  });
});
