export const maximumKvPackageBytes = 25 * 1024 * 1024;

export class PackageStorageUnavailableError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = "PackageStorageUnavailableError";
  }
}

const requirePackageMetadata = (product, maximumBytes = Number.MAX_SAFE_INTEGER) => {
  const packageMetadata = product?.package;
  if (!packageMetadata
    || typeof packageMetadata.artifactKey !== "string"
    || !Number.isSafeInteger(packageMetadata.sizeBytes)
    || packageMetadata.sizeBytes < 1
    || typeof packageMetadata.sha256 !== "string") {
    throw new PackageStorageUnavailableError("Package metadata is incomplete.");
  }
  if (packageMetadata.sizeBytes > maximumBytes) {
    throw new PackageStorageUnavailableError("Package exceeds the configured storage limit.");
  }
  return packageMetadata;
};

const requireStoredPackage = (stored, expected) => {
  const value = stored?.value;
  const metadata = stored?.metadata;
  if (!(value instanceof ArrayBuffer)
    || value.byteLength !== expected.sizeBytes
    || metadata?.sizeBytes !== expected.sizeBytes
    || metadata?.sha256 !== expected.sha256) {
    throw new PackageStorageUnavailableError("Stored package does not match its verified release metadata.");
  }
  return {
    body: value,
    etag: typeof metadata.etag === "string" ? metadata.etag : null,
    contentType: metadata.contentType === "application/zip" ? metadata.contentType : "application/zip",
  };
};

const createKvPackageStorage = (namespace) => {
  if (!namespace || typeof namespace.getWithMetadata !== "function") {
    throw new PackageStorageUnavailableError("The KV package binding is unavailable.");
  }

  const read = async (product) => {
    const expected = requirePackageMetadata(product, maximumKvPackageBytes);
    try {
      const stored = await namespace.getWithMetadata(expected.artifactKey, { type: "arrayBuffer" });
      return requireStoredPackage(stored, expected);
    } catch (error) {
      if (error instanceof PackageStorageUnavailableError) throw error;
      throw new PackageStorageUnavailableError("KV package storage could not be read.", { cause: error });
    }
  };

  return Object.freeze({
    driver: "kv",
    inspect: read,
    read,
  });
};

const createR2PackageStorage = (bucket) => {
  if (!bucket || typeof bucket.get !== "function") {
    throw new PackageStorageUnavailableError("The R2 package binding is unavailable.");
  }

  const read = async (product) => {
    const expected = requirePackageMetadata(product);
    try {
      const object = await bucket.get(expected.artifactKey);
      if (!object
        || object.size !== expected.sizeBytes
        || object.customMetadata?.sha256 !== expected.sha256) {
        throw new PackageStorageUnavailableError("Stored package does not match its verified release metadata.");
      }
      return {
        body: object.body,
        etag: object.httpEtag ?? null,
        contentType: "application/zip",
      };
    } catch (error) {
      if (error instanceof PackageStorageUnavailableError) throw error;
      throw new PackageStorageUnavailableError("R2 package storage could not be read.", { cause: error });
    }
  };

  return Object.freeze({
    driver: "r2",
    inspect: read,
    read,
  });
};

export const createPackageStorage = (env) => {
  if (env.PACKAGE_STORAGE_DRIVER === "kv") return createKvPackageStorage(env.PACKAGES);
  if (env.PACKAGE_STORAGE_DRIVER === "r2") return createR2PackageStorage(env.PACKAGES);
  throw new PackageStorageUnavailableError("The package storage driver is unavailable.");
};
