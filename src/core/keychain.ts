import keytar from 'keytar';

const SERVICE_NAME = 'sanegit';

export async function getCredential(account: string): Promise<string | null> {
  return await keytar.getPassword(SERVICE_NAME, account);
}

export async function setCredential(account: string, secret: string): Promise<void> {
  await keytar.setPassword(SERVICE_NAME, account, secret);
}

export async function deleteCredential(account: string): Promise<void> {
  await keytar.deletePassword(SERVICE_NAME, account);
}
