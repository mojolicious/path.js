/*!
 * path.js
 * Copyright (C) 2021 Sebastian Riedel
 * MIT Licensed
 */
import type EventEmitter from 'node:events';
import type stream from 'node:stream';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import url from 'node:url';
import StackUtils from 'stack-utils';

interface StreamOptions {
  flags?: string;
  encoding?: BufferEncoding;
  fd?: number | fsPromises.FileHandle;
  mode?: number;
  autoClose?: boolean;
  emitClose?: boolean;
  start?: number;
  highWaterMark?: number;
}

interface ReadStreamOptions extends StreamOptions {
  end?: number;
}

type NodeError = Error & {code: string};

export default class Path {
  _path: string;

  /**
   * Create a `Path` instance for the given path or the current working directory.
   * @example
   * // Relative file
   * const file = new Path('work', 'notes.txt');
   *
   * // Current working directory
   * const dir = new Path();
   */
  constructor(...parts: string[]) {
    this._path = parts.length === 0 ? process.cwd() : parts.length === 1 ? parts[0] : path.join(...parts);
  }

  /**
   * Asynchronously tests a user's permissions for the file or directory.
   * @see https://nodejs.org/api/fs.html#fs_fspromises_access_path_mode
   */
  async access(mode: number): Promise<boolean> {
    return await fsPromises.access(this._path, mode).then(
      () => true,
      () => false
    );
  }

  /**
   * Synchronously tests a user's permissions for the file or directory.
   * @see https://nodejs.org/api/fs.html#fs_fs_accesssync_path_mode
   */
  accessSync(mode: number): boolean {
    try {
      fs.accessSync(this._path, mode);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Asynchronously append data to a file, creating the file if it does not yet exist.
   * @see https://nodejs.org/api/fs.html#filehandleappendfiledata-options
   */
  async appendFile(
    data: string | Uint8Array,
    options?: BufferEncoding | (fs.ObjectEncodingOptions & fs.promises.FlagAndOpenMode)
  ): Promise<this> {
    await fsPromises.appendFile(this._path, data, options);
    return this;
  }

  /**
   * Synchronously append data to a file, creating the file if it does not yet exist.
   * @see https://nodejs.org/api/fs.html#fsappendfilesyncpath-data-options
   */
  appendFileSync(data: string | Uint8Array, options?: fs.WriteFileOptions): this {
    fs.appendFileSync(this._path, data, options);
    return this;
  }

  /**
   * Returns the last portion of a path, similar to the Unix `basename` command.
   * @see https://nodejs.org/api/path.html#path_path_basename_path_ext
   */
  basename(ext?: string): string {
    return path.basename(this._path, ext);
  }

  /**
   * Create a new `Path` object for the caller source file.
   */
  static callerFile(): Path {
    return Path.fromFileURL(new StackUtils().capture(3)[2].getFileName() ?? '');
  }

  /**
   * Create a new `Path` object relative to the current path.
   * @example
   * // "/home/kraih/notes.txt"
   * const home = new Path('/home/kraih');
   * const file = home.child('notes.txt');
   */
  child(...parts: string[]): Path {
    return new Path(this._path, ...parts);
  }

  /**
   * Asynchronously changes the permissions of a file.
   * @see https://nodejs.org/api/fs.html#fs_fspromises_chmod_path_mode
   */
  async chmod(mode: string | number): Promise<this> {
    await fsPromises.chmod(this._path, mode);
    return this;
  }

  /**
   * Synchronously changes the permissions of a file.
   * @see https://nodejs.org/api/fs.html#fs_fs_chmodsync_path_mode
   */
  chmodSync(mode: string | number): this {
    fs.chmodSync(this._path, mode);
    return this;
  }

  /**
   * Asynchronously change the ownership of a file.
   * @see https://nodejs.org/api/fs.html#fspromiseschownpath-uid-gid
   */
  async chown(uid: number, gid: number): Promise<this> {
    await fsPromises.chown(this._path, uid, gid);
    return this;
  }

  /**
   * Synchronously change the ownership of a file.
   * @see https://nodejs.org/api/fs.html#fschownsyncpath-uid-gid
   */
  chownSync(uid: number, gid: number): this {
    fs.chownSync(this._path, uid, gid);
    return this;
  }

  /**
   * Returns an object containing commonly used constants for file system operations.
   * @see https://nodejs.org/api/fs.html#fs_fs_constants
   */
  static get constants(): typeof fs.constants {
    return fs.constants;
  }

  /**
   * Asynchronously copies file to destination.
   * @see https://nodejs.org/api/fs.html#fs_fspromises_copyfile_src_dest_mode
   */
  async copyFile(destination: Path | string, flags?: number): Promise<this> {
    await fsPromises.copyFile(this._path, destination.toString(), flags);
    return this;
  }

  /**
   * Synchronously copies file to destination.
   * @see https://nodejs.org/api/fs.html#fs_fs_copyfilesync_src_dest_mode
   */
  copyFileSync(destination: Path | string, flags?: number): this {
    fs.copyFileSync(this._path, destination.toString(), flags);
    return this;
  }

  /**
   * Create a readable stream for file.
   * @see https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options
   */
  createReadStream(options?: BufferEncoding | ReadStreamOptions | undefined): fs.ReadStream {
    return fs.createReadStream(this._path, options);
  }

  /**
   * Create a writable stream for file.
   * @see https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options
   */
  createWriteStream(options?: BufferEncoding | StreamOptions | undefined): fs.WriteStream {
    return fs.createWriteStream(this._path, options);
  }

  /**
   * Create a new `Path` object for the current source file.
   */
  static currentFile(): Path {
    return Path.fromFileURL(new StackUtils().capture(2)[1].getFileName() ?? '');
  }

  /**
   * Returns the directory name of a path, similar to the Unix `dirname` command.
   * @see https://nodejs.org/api/path.html#path_path_dirname_path
   */
  dirname(): Path {
    return new Path(path.dirname(this._path));
  }

  /**
   * Asynchronously check if file or directory exists.
   */
  async exists(): Promise<boolean> {
    return await this.access(fs.constants.F_OK);
  }

  /**
   * Synchronously check if file or directory exists.
   */
  existsSync(): boolean {
    return this.accessSync(fs.constants.F_OK);
  }

  /**
   * Returns the extension of the path, from the last occurrence of the `.` (period) character to end of string in the
   * last portion of the path.
   * @see https://nodejs.org/api/path.html#path_path_extname_path
   */
  extname(): string {
    return path.extname(this._path);
  }

  /**
   * Create a new `Path` object from a `file://` URL.
   */
  static fromFileURL(file: string): Path {
    return new Path(url.fileURLToPath(file));
  }

  /**
   * Determine if path is an absolute path.
   * @see https://nodejs.org/api/path.html#path_path_isabsolute_path
   */
  isAbsolute(): boolean {
    return path.isAbsolute(this._path);
  }

  /**
   * Asynchronously check if file is readable.
   */
  async isReadable(): Promise<boolean> {
    return await this.access(fs.constants.R_OK);
  }

  /**
   * Synchronously check if file is readable.
   */
  isReadableSync(): boolean {
    return this.accessSync(fs.constants.R_OK);
  }

  /**
   * Asynchronously check if file is writable.
   */
  async isWritable(): Promise<boolean> {
    return await this.access(fs.constants.W_OK);
  }

  /**
   * Synchronously check if file is writable.
   */
  isWritableSync(): boolean {
    return this.accessSync(fs.constants.W_OK);
  }

  /**
   * List files in directory.
   * @example
   * // List files recursively
   * const dir = new Path('/tmp');
   * for await (const file of dir.list({recursive: true})) {
   *   console.log(file.toString());
   * }
   */
  async *list(
    options: {dir?: boolean; hidden?: boolean; maxDepth?: number; recursive?: boolean} = {}
  ): AsyncIterable<Path> {
    const files = await fsPromises.readdir(this._path, {withFileTypes: true});

    const maxDepth = options.maxDepth;
    for (const file of files) {
      if (options.hidden !== true && file.name.startsWith('.')) continue;

      const full = path.resolve(this._path, file.name);
      if (file.isDirectory()) {
        if (options.dir === true) yield new Path(full);
        if (options.recursive === true && options.maxDepth !== 1) {
          yield* new Path(full).list(maxDepth === undefined ? options : {...options, maxDepth: maxDepth - 1});
        }
      } else {
        yield new Path(full);
      }
    }
  }

  /**
   * Read file one line at a time.
   * @example
   * // Decode UTF-8 file
   * const file = new Path('notes.txt');
   * for await (const line of file.lines({encoding: 'utf8'})) {
   *   console.log(line);
   * }
   */
  lines(options?: stream.ReadableOptions): readline.Interface {
    return readline.createInterface({input: this.createReadStream(options), crlfDelay: Infinity});
  }

  /**
   * Equivalent to `stat` unless path refers to a symbolic link, in which case the link itself is stat-ed, not the file
   * that it refers to.
   * @see https://nodejs.org/api/fs.html#fs_fspromises_lstat_path_options
   */
  async lstat(options?: fs.StatOptions): Promise<fs.Stats | fs.BigIntStats> {
    return await fsPromises.lstat(this._path, options);
  }

  /**
   * Equivalent to `statSync` unless path refers to a symbolic link, in which case the link itself is stat-ed, not the
   * file that it refers to.
   * @see https://nodejs.org/api/fs.html#fs_fs_lstatsync_path_options
   */
  lstatSync(options?: fs.StatOptions): fs.Stats | fs.BigIntStats | undefined {
    return fs.lstatSync(this._path, options);
  }

  /**
   * Asynchronously creates a directory.
   * @see https://nodejs.org/api/fs.html#fs_fspromises_mkdir_path_options
   */
  async mkdir(options?: fs.MakeDirectoryOptions & {recursive: true}): Promise<this> {
    await fsPromises.mkdir(this._path, options);
    return this;
  }

  /**
   * Synchronously creates a directory.
   * @see https://nodejs.org/api/fs.html#fs_fs_mkdirsync_path_options
   */
  mkdirSync(options?: fs.MakeDirectoryOptions & {recursive: true}): this {
    fs.mkdirSync(this._path, options);
    return this;
  }

  /**
   * Normalizes the given path, resolving `..` and `.` segments.
   * @see https://nodejs.org/api/path.html#path_path_normalize_path
   */
  normalize(): Path {
    return new Path(path.normalize(this._path));
  }

  /**
   * Asynchronously open file.
   * @see https://nodejs.org/api/fs.html#fs_fspromises_open_path_flags_mode
   */
  async open(flags: string | number, mode?: string | number): Promise<fsPromises.FileHandle> {
    return await fsPromises.open(this._path, flags, mode);
  }

  /**
   * Asynchronously reads the entire contents of a file.
   * @see https://nodejs.org/api/fs.html#fs_fspromises_readfile_path_options
   */
  async readFile(
    options?: BufferEncoding | (fs.ObjectEncodingOptions & EventEmitter.Abortable & {flag?: fs.OpenMode})
  ): Promise<string | Buffer> {
    return await fsPromises.readFile(this._path, options);
  }

  /**
   * Synchronously reads the entire contents of a file.
   * @see https://nodejs.org/api/fs.html#fs_fs_readfilesync_path_options
   */
  readFileSync(options?: BufferEncoding | (fs.ObjectEncodingOptions & {flag?: string})): string | Buffer {
    return fs.readFileSync(this._path, options);
  }

  /**
   * Returns the relative path from path to `to` based on the current working directory.
   * @see https://nodejs.org/api/path.html#path_path_relative_from_to
   */
  relative(to: Path | string): Path {
    return new Path(path.relative(this._path, to.toString()));
  }

  /**
   * Asynchronously renames path to `newPath`.
   * @see https://nodejs.org/api/fs.html#fs_fspromises_rename_oldpath_newpath
   */
  async rename(newPath: Path | string): Promise<void> {
    return await fsPromises.rename(this._path, newPath.toString());
  }

  /**
   * Synchronously renames path to `newPath`.
   * @see https://nodejs.org/api/fs.html#fs_fs_renamesync_oldpath_newpath
   */
  renameSync(newPath: Path | string): void {
    fs.renameSync(this._path, newPath.toString());
  }

  /**
   * Asynchronously computes the canonical pathname.
   * @see https://nodejs.org/api/fs.html#fs_fspromises_realpath_path_options
   */
  async realpath(options?: fs.ObjectEncodingOptions): Promise<Path> {
    return await fsPromises.realpath(this._path, options).then(path => new Path(path));
  }

  /**
   * Synchronously computes the canonical pathname.
   * @see https://nodejs.org/api/fs.html#fs_fs_realpathsync_path_options
   */
  realpathSync(options?: fs.ObjectEncodingOptions): Path {
    return new Path(fs.realpathSync(this._path, options));
  }

  /**
   * Asynchronously removes files and directories (modeled on the standard POSIX `rm` utility).
   * @see https://nodejs.org/api/fs.html#fs_fspromises_rm_path_options
   */
  async rm(options?: fs.RmOptions): Promise<void> {
    return await fsPromises.rm(this._path, options);
  }

  /**
   * Synchronously removes files and directories (modeled on the standard POSIX `rm` utility).
   * @see https://nodejs.org/api/fs.html#fs_fs_rmsync_path_options
   */
  rmSync(options?: fs.RmOptions): void {
    fs.rmSync(this._path, options);
  }

  /**
   * Create a new `Path` object relative to the parent directory.
   * @example
   * // "/home/kraih/users.txt"
   * const notes = new Path('/home/kraih/notes.txt');
   * const users = notes.sibling('users.txt');
   */
  sibling(...parts: string[]): Path {
    return this.dirname().child(...parts);
  }

  /**
   * Asynchronously retrieves stat information for the path.
   * @see https://nodejs.org/api/fs.html#fs_fspromises_stat_path_options
   */
  async stat(options?: fs.StatOptions): Promise<fs.Stats | fs.BigIntStats> {
    return await fsPromises.stat(this._path, options);
  }

  /**
   * Synchronously retrieves stat information for the path.
   * @see https://nodejs.org/api/fs.html#fs_fs_statsync_path_options
   */
  statSync(options?: fs.StatOptions): fs.Stats | fs.BigIntStats | undefined {
    return fs.statSync(this._path, options);
  }

  /**
   * Asynchronously creates a symbolic link.
   * @see https://nodejs.org/api/fs.html#fs_fspromises_symlink_target_path_type
   */
  async symlink(link: Path | string, type?: fs.symlink.Type): Promise<this> {
    await fsPromises.symlink(this._path, link.toString(), type);
    return this;
  }

  /**
   * Synchronously creates a symbolic link.
   * @see https://nodejs.org/api/fs.html#fs_fs_symlinksync_target_path_type
   */
  symlinkSync(link: Path | string, type?: fs.symlink.Type): this {
    fs.symlinkSync(this._path, link.toString(), type);
    return this;
  }

  /**
   * Asynchronously truncates (shortens or extends the length) of the file.
   * @see https://nodejs.org/api/fs.html#fs_fspromises_truncate_path_len
   */
  async truncate(len?: number): Promise<this> {
    await fsPromises.truncate(this._path, len);
    return this;
  }

  /**
   * Synchronously truncates (shortens or extends the length) of the file.
   * @see https://nodejs.org/api/fs.html#fs_fs_truncatesync_path_len
   */
  truncateSync(len?: number): this {
    fs.truncateSync(this._path, len);
    return this;
  }

  /**
   * Create a new `TempDir` object (`Path` subclass with `destroy` and `destroySync` methods) for a temporary directory.
   */
  static async tempDir(options?: fs.ObjectEncodingOptions & {dir?: Path; name?: string}): Promise<TempDir> {
    return await fsPromises.mkdtemp(tempDirPrefix(options?.dir, options?.name), options).then(path => {
      tempDirCleanup.push(path);
      return new TempDir(path);
    });
  }

  /**
   * Create a new `TempDir` object (`Path` subclass with `destroy` and `destroySync` methods) for a temporary directory.
   */
  static tempDirSync(options?: fs.ObjectEncodingOptions & {dir?: Path; name?: string}): TempDir {
    const dir = fs.mkdtempSync(tempDirPrefix(options?.dir, options?.name), options);
    tempDirCleanup.push(dir);
    return new TempDir(dir);
  }

  /**
   * Create file if it does not exist or change the modification and access time to the current time.
   */
  async touch(): Promise<this> {
    const now = new Date();
    try {
      await fsPromises.utimes(this._path, now, now);
    } catch (error) {
      await this.open('w').then(async value => await value.close());
    }

    return this;
  }

  /**
   * Create file if it does not exist or change the modification and access time to the current time.
   */
  touchSync(): this {
    const now = new Date();
    try {
      fs.utimesSync(this._path, now, now);
    } catch (error) {
      fs.closeSync(fs.openSync(this._path, 'w'));
    }

    return this;
  }

  /**
   * Split the path.
   */
  toArray(): string[] {
    return this._path.split(path.sep);
  }

  /**
   * Convert path into a `file://` `URL` object.
   */
  toFileURL(): URL {
    return url.pathToFileURL(this._path);
  }

  /**
   * Returns an object whose properties represent significant elements of the path.
   */
  toObject(): path.ParsedPath {
    return path.parse(this._path);
  }

  /**
   * Convert path into a string.
   */
  toString(): string {
    return `${this._path}`;
  }

  /**
   * Change the file system timestamps of the object referenced by path.
   * @see https://nodejs.org/api/fs.html#fs_fspromises_utimes_path_atime_mtime
   */
  async utimes(atime: string | number | Date, mtime: string | number | Date): Promise<this> {
    await fsPromises.utimes(this._path, atime, mtime);
    return this;
  }

  /**
   * Change the file system timestamps of the object referenced by path.
   * @see https://nodejs.org/api/fs.html#fs_fs_utimessync_path_atime_mtime
   */
  utimesSync(atime: string | number | Date, mtime: string | number | Date): this {
    fs.utimesSync(this._path, atime, mtime);
    return this;
  }

  /**
   * Asynchronously writes data to a file, replacing the file if it already exists.
   * @see https://nodejs.org/api/fs.html#fs_fspromises_writefile_file_data_options
   */
  async writeFile(
    data: string | Uint8Array,
    options?: fs.ObjectEncodingOptions & {mode?: fs.Mode; flag?: fs.OpenMode} & EventEmitter.Abortable
  ): Promise<this> {
    await fsPromises.writeFile(this._path, data, options);
    return this;
  }

  /**
   * Synchronously writes data to a file, replacing the file if it already exists.
   * @see https://nodejs.org/api/fs.html#fs_fs_writefilesync_file_data_options
   */
  writeFileSync(data: string | Uint8Array, options?: fs.WriteFileOptions): this {
    fs.writeFileSync(this._path, data, options);
    return this;
  }
}

class TempDir extends Path {
  /**
   * Asynchronously remove temporary directory.
   */
  async destroy(): Promise<void> {
    await fsPromises.rm(this._path, {recursive: true});
    tempDirRemoved(this._path);
  }

  /**
   * Synchronously remove temporary directory.
   */
  destroySync(): void {
    fs.rmSync(this._path, {recursive: true});
    tempDirRemoved(this._path);
  }
}

function tempDirPrefix(dir?: Path, name?: string) {
  return path.join(dir === undefined ? os.tmpdir() : dir.toString(), name ?? 'node-');
}

let tempDirCleanup: string[] = [];
function tempDirRemoved(path: string): void {
  tempDirCleanup = tempDirCleanup.filter(tempPath => tempPath !== path);
}

process.on('exit', () => {
  for (const path of tempDirCleanup) {
    try {
      fs.rmSync(path, {recursive: true});
    } catch (error) {
      if (!(error instanceof Error) || (error as NodeError).code !== 'ENOENT') throw error;
    }
  }
});
