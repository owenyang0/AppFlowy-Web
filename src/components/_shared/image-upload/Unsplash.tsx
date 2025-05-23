import { openUrl } from '@/utils/url';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createApi } from 'unsplash-js';
import TextField from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import debounce from 'lodash-es/debounce';
import { CircularProgress } from '@mui/material';

const unsplash = createApi({
  accessKey: '1WxD1JpMOUX86lZKKob4Ca0LMZPyO2rUmAgjpWm9Ids',
});

const SEARCH_DEBOUNCE_TIME = 500;

export function Unsplash ({ onDone, onEscape }: { onDone?: (value: string) => void; onEscape?: () => void }) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [photos, setPhotos] = useState<
    {
      thumb: string;
      full: string;
      alt: string | null;
      id: string;
      user: {
        name: string;
        link: string;
      };
    }[]
  >([]);
  const [searchValue, setSearchValue] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setSearchValue(value);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.();
      }
    },
    [onEscape],
  );

  const loadPhotos = useCallback(async (searchValue: string) => {
    const pages = 4;
    const perPage = 30;
    const requests = Array.from({ length: pages }, (_, i) =>
      searchValue ? unsplash.search.getPhotos({
        query: searchValue,
        perPage,
        page: i + 1,
      }) : unsplash.photos.list({ perPage, page: i + 1 }),
    );

    setError('');
    setLoading(true);

    const results = await Promise.all(requests);

    setLoading(false);

    const photos = results.flatMap((result) => {
      if (result.errors) {
        setError(result.errors[0]);
        return [];
      }

      return result.response.results.map((photo) => ({
        id: photo.id,
        thumb: photo.urls.thumb,
        full: photo.urls.full,
        alt: photo.alt_description,
        user: {
          name: photo.user.name,
          link: photo.user.links.html,
        },
      }));
    });

    setPhotos(photos);

    return photos;

  }, []);

  const debounceSearchPhotos = useMemo(() => {
    return debounce(loadPhotos, SEARCH_DEBOUNCE_TIME);
  }, [loadPhotos]);

  useEffect(() => {
    void debounceSearchPhotos(searchValue);
    return () => {
      debounceSearchPhotos.cancel();
    };
  }, [debounceSearchPhotos, searchValue]);

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={'flex h-fit flex-col gap-4 px-4 pb-4 max-w-[600px]'}
    >
      <TextField
        autoFocus
        onKeyDown={handleKeyDown}
        size={'small'}
        spellCheck={false}
        onChange={handleChange}
        value={searchValue}
        placeholder={t('document.imageBlock.searchForAnImage')}
        fullWidth
      />

      {loading ? (
        <div className={'flex h-[120px] w-full items-center justify-center gap-2 text-xs'}>
          <CircularProgress size={24} />
          <div className={'text-xs text-text-caption'}>{t('editor.loading')}</div>
        </div>
      ) : error ? (
        <Typography className={'flex h-[120px] w-full items-center justify-center gap-2 text-xs text-function-error'}>
          {error}
        </Typography>
      ) : (
        <div className={'flex flex-col gap-4'}>
          {photos.length > 0 ? (
            <>
              <div
                className={`grid gap-4 w-full grid-cols-4 max-sm:grid-cols-3`}
              >
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className={'flex flex-col gap-2'}
                  >
                    <div className={'relative pt-[56.25%]'}>
                      <img
                        onClick={() => {
                          onDone?.(photo.full);
                        }}
                        src={photo.thumb}
                        alt={photo.alt ?? ''}
                        className={`absolute top-0 left-0 w-[128px] h-full rounded object-cover cursor-pointer hover:opacity-80 transition-opacity`}
                      />
                    </div>
                    <div className={'w-full truncate text-xs text-text-caption'}>
                      by
                      <span
                        onClick={() => {
                          void openUrl(photo.user.link);
                        }}
                        className={'underline cursor-pointer underline-offset-[3px] ml-2 hover:text-function-info'}
                      >
                        {photo.user.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Typography className={'w-full text-center text-xs text-text-caption'}>
                {t('findAndReplace.searchMore')}
              </Typography>
            </>
          ) : (
            <Typography className={'flex h-[120px] w-full items-center justify-center gap-2 text-xs text-text-caption'}>
              {t('findAndReplace.noResult')}
            </Typography>
          )}
        </div>
      )}
    </div>
  );
}
