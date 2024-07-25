import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { isAddress } from "viem";

import Checkbox from "@/components/atoms/Checkbox";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import Svg from "@/components/atoms/Svg";
import TextField from "@/components/atoms/TextField";
import Button, { ButtonSize } from "@/components/buttons/Button";
import { ManageTokensDialogContent } from "@/components/manage-tokens/types";
import { db } from "@/db/db";
import useAutoListingApolloClient from "@/hooks/useAutoListingApolloClient";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import addToast from "@/other/toast";
import { Token } from "@/sdk_hybrid/entities/token";

const query = gql`
  query AutoListings($address: String!) {
    autoListings(where: { id: $address }) {
      id
      owner
      name
      lastUpdated
      totalTokens
      tokens {
        timestamp
        token {
          addressERC20
          addressERC223
          name
          symbol
          decimals
          numberAdditions
        }
      }
    }
  }
`;

interface Props {
  setContent: (content: ManageTokensDialogContent) => void;
}
export default function ImportListWithContract({ setContent }: Props) {
  const t = useTranslations("ManageTokens");
  const chainId = useCurrentChainId();
  const [addressToImport, setAddressToImport] = useState("");
  const [checkedUnderstand, setCheckedUnderstand] = useState<boolean>(false);

  const client = useAutoListingApolloClient();

  const { data, loading } = useQuery(query, {
    variables: {
      address: addressToImport.toLowerCase(),
    },
    client,
  });

  const error = useMemo(() => {
    if (addressToImport && !isAddress(addressToImport)) {
      return "Enter contract address in correct format";
    }

    if (
      addressToImport &&
      isAddress(addressToImport) &&
      !loading &&
      !Boolean(data.autoListings?.[0])
    ) {
      return "Contract address does not contain a token list";
    }

    return "";
  }, [addressToImport, data?.autoListings, loading]);
  console.log(data);

  return (
    <div className="flex flex-col flex-grow">
      <TextField
        variant="search"
        label="Import token list from contract"
        type="text"
        value={addressToImport}
        onChange={(e) => {
          setAddressToImport(e.target.value);
        }}
        placeholder="Contract address"
        error={error}
      />

      {!addressToImport && (
        <div className="flex-grow flex justify-center items-center flex-col gap-2">
          <EmptyStateIcon iconName="autolisting" />
          <p className="text-secondary-text text-center">
            To import a list through a contract, enter contract address in correct format{" "}
          </p>
        </div>
      )}

      {addressToImport && !isAddress(addressToImport) && (
        <div className="flex-grow flex justify-center items-center flex-col gap-2">
          <EmptyStateIcon iconName="warning" />
          <p className="text-red-input text-center">Enter valid contract address</p>
        </div>
      )}

      {addressToImport &&
        isAddress(addressToImport) &&
        !loading &&
        !Boolean(data.autoListings?.[0]) && (
          <div className="flex-grow flex justify-center items-center flex-col gap-2">
            <EmptyStateIcon iconName="warning" />
            <p className="text-red-input text-center">
              Contract address does not contain a token list
            </p>
          </div>
        )}

      {Boolean(data?.autoListings?.[0]) && (
        <>
          <div className="flex-grow">
            <div className="flex items-center gap-3 pb-2.5 mb-3">
              <img
                className="w-12 h-12"
                width={48}
                height={48}
                src="/token-list-placeholder.svg"
                alt=""
              />
              <div className="flex flex-col text-16">
                <span className="text-primary-text">
                  {" "}
                  {data?.autoListings?.[0].name === "unknown"
                    ? `Autolisting ${data?.autoListings?.[0].id.toLowerCase().slice(0, 6)}...${data?.autoListings?.[0].id.toLowerCase().slice(-6)}`
                    : data?.autoListings?.[0].name}
                </span>
                <span className="text-secondary-text">
                  {t("tokens_amount", { amount: data?.autoListings?.[0].tokens.length })}
                </span>
              </div>
            </div>
            <div className="px-5 py-3 flex gap-2 rounded-1 border border-orange bg-orange-bg">
              <Svg className="text-orange shrink-0" iconName="warning" />
              <p className="text-16 text-primary-text flex-grow">{t("adding_list_warning")}</p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <Checkbox
              checked={checkedUnderstand}
              handleChange={() => setCheckedUnderstand(!checkedUnderstand)}
              id="approve-list-import"
              label={t("i_understand")}
            />
            <Button
              fullWidth
              disabled={!checkedUnderstand}
              size={ButtonSize.MEDIUM}
              onClick={async () => {
                const queryRes = data?.autoListings?.[0];
                if (!queryRes) {
                  addToast("Something went wrong, please, contact support");
                  return;
                }
                await db.tokenLists.add({
                  autoListingContract: queryRes.id.toLowerCase(),
                  lastUpdated: queryRes.lastUpdated,
                  list: {
                    logoURI: "/token-list-placeholder.svg",
                    name:
                      queryRes.name === "unknown"
                        ? `Autolisting ${queryRes.id.toLowerCase().slice(0, 6)}...${queryRes.id.toLowerCase().slice(-6)}`
                        : queryRes.name,
                    version: {
                      major: 0,
                      minor: 0,
                      patch: 1,
                    },
                    tokens: queryRes.tokens.map(({ token }: any) => {
                      console.log(token.decimals);
                      return new Token(
                        chainId,
                        token.addressERC20,
                        token.addressERC223,
                        +token.decimals,
                        token.symbol,
                        token.name,
                        "/tokens/placeholder.svg",
                      );
                    }),
                  },
                  chainId,
                  enabled: true,
                });
                addToast("Tokenlist imported successfully!");
                setContent("default");
              }}
            >
              {t("import_list")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
